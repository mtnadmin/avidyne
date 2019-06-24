<?php

namespace WPDM\libs;

class FileSystem
{
    function __construct(){

    }

    public static function uploadFile($FILE){

    }

    /**
     * @usage Download Given File
     * @param $filepath
     * @param $filename
     * @param int $speed
     * @param int $resume_support
     * @param array $extras
     */
    public static function donwloadFile($filepath, $filename, $speed = 1024, $resume_support = 1, $extras = array())
    {

        if (isset($extras['package']))
            $package = $extras['package'];

        if(wpdm_is_url($filepath)){
            header("location: ".$filepath);
            die();
        }

        $mdata = wp_check_filetype($filepath);

        $ext = explode('.', $filepath);
        $ext = end($ext);
        if(in_array($ext, array('php', 'js', 'html'))) \WPDM_Messages::error("Invalid File Type (.{$ext})!", 1);

        $content_type = $mdata['type'];

        $buffer = $speed ? $speed : 1024; // bytes

        $buffer *= 1024; // to bits

        $bandwidth = 0;

        if( function_exists('ini_set') )
            @ini_set( 'display_errors', 0 );

        @session_write_close();

        if ( function_exists( 'apache_setenv' ) )
            @apache_setenv( 'no-gzip', 1 );

        if( function_exists('ini_set') )
            @ini_set('zlib.output_compression', 'Off');


        @set_time_limit(0);
        @session_cache_limiter('none');

        if ( get_option( '__wpdm_support_output_buffer', 1 ) == 1 ) {
            $pcl = ob_get_level();
            do {
                @ob_end_clean();
                if(ob_get_level() == $pcl) break;
                $pcl = ob_get_level();
            } while ( ob_get_level() > 0 );
        }

        if (strpos($filepath, '://'))
            $filepath = wpdm_cache_remote_file($filepath, $filename);

        if (file_exists($filepath))
            $fsize = filesize($filepath);
        else
            $fsize = 0;
        $org_size = $fsize;
        nocache_headers();
        header( "X-Robots-Tag: noindex, nofollow", true );
        header("Robots: none");
        header ('Content-Description: File Transfer') ;
        
        if(strpos($_SERVER['HTTP_USER_AGENT'],"Safari") && !isset($extras['play']) && !get_option('__wpdm_open_in_browser', 0))
            $content_type = "application/octet-stream";

        header("Content-type: $content_type");

        if(!isset($extras['play'])) {
            if (get_option('__wpdm_open_in_browser', 0) || wpdm_query_var('open') == 1)
                header("Content-disposition: inline;filename=\"{$filename}\"");
            else
                header("Content-disposition: attachment;filename=\"{$filename}\"");

            header("Content-Transfer-Encoding: binary");
        }


        if( ( isset($extras['play']) && strpos($_SERVER['HTTP_USER_AGENT'],"Safari") ) || get_option('__wpdm_download_resume',1)==2 ) {
            readfile($filepath);
            return;
        }

        $file = @fopen($filepath, "rb");

        //check if http_range is sent by browser (or download manager)
        if (isset($_SERVER['HTTP_RANGE']) && $fsize > 0) {
            list($bytes, $http_range) = explode("=", $_SERVER['HTTP_RANGE']);

            $tmp = explode('-', $http_range);
            $tmp = array_shift($tmp);
            $set_pointer = intval($tmp);

            $new_length = $fsize - $set_pointer;

            header("Accept-Ranges: bytes");
            //header("Accept-Ranges: 0-$fsize");
            $proto = isset($_SERVER['SERVER_PROTOCOL'])?$_SERVER['SERVER_PROTOCOL']:'HTTP/1.1';
            header("{$proto} 206 Partial Content");

            header("Content-Length: $new_length");
            header("Content-Range: bytes $http_range-$fsize/$org_size");

            fseek($file, $set_pointer);

        } else {
            header("Content-Length: " . $fsize);
        }
        $packet = 1;

        if ($file) {
            while (!(connection_aborted() || connection_status() == 1) && $fsize > 0) {
                if ($fsize > $buffer)
                    echo fread($file, $buffer);
                else
                    echo fread($file, $fsize);
                @ob_flush();
                @flush();
                $fsize -= $buffer;
                $bandwidth += $buffer;
                if ($speed > 0 && ($bandwidth > $speed * $packet * 1024)) {
                    sleep(1);
                    $packet++;
                }


            }
            $package['downloaded_file_size'] = $fsize;
            //add_action('wpdm_download_completed', $package);
            @fclose($file);
        }

        return;

    }

    /**
     * @usage Download any content as a file
     * @param $filename
     * @param $content
     */
    public static function downloadData($filename, $content){
        @ob_end_clean();
        nocache_headers();
        $filetype = wp_check_filetype($filename);
        header( "X-Robots-Tag: noindex, nofollow", true );
        header("Robots: none");
        header("Content-Description: File Transfer");
        header("Content-Type: {$filetype['type']}");
        header("Content-disposition: attachment;filename=\"$filename\"");
        header("Content-Transfer-Encoding: Binary");
        header("Content-Length: " . strlen($content));
        echo $content;
    }

    /**
     * @usage Sends download headers only
     * @param $filename
     * @param int $size
     */
    public static function downloadHeaders($filename, $size = null){
        @ob_end_clean();
        $filetype = wp_check_filetype($filename);
        header("Content-Description: File Transfer");
        header("Content-Type: {$filetype['type']}");
        header("Content-disposition: attachment;filename=\"$filename\"");
        header("Content-Transfer-Encoding: Binary");
        if($size)
        header("Content-Length: " . $size);
    }


    /**
     * @usage Download any content as a file
     * @param $filename
     * @param $content
     */
    public static function mkDir($path, $mode = 0777, $recur = false){
        mkdir($path, $mode, $recur);
    }

    /**
     * @usage Create ZIP from given file list
     * @param $files
     * @param $zipname
     * @return bool|string
     */
    public static function zipFiles($files, $zipname){

        $zipped = (basename($zipname) == $zipname)? WPDM_CACHE_DIR.sanitize_file_name($zipname):$zipname;

        if(!strpos($zipname, '.zip')) $zipped .= '.zip';

        if(file_exists($zipped))
            unlink($zipped);

        if(count($files) <1 ) return false;

        $zip = new \ZipArchive();
        if ($zip->open($zipped, \ZIPARCHIVE::CREATE) !== TRUE) {
            return false;
        }
        foreach ($files as $file) {
            $file = trim($file);
            if (file_exists(UPLOAD_DIR . $file)) {
                $fnm = preg_replace("/^[0-9]+?wpdm_/", "", $file);
                $zip->addFile(UPLOAD_DIR . $file, $fnm);
            } else if (file_exists($file)){
                $fname = basename($file);
                $zip->addFile($file, $fname);
            }
            //else if (file_exists(WP_CONTENT_DIR . end($tmp = explode("wp-content", $file)))) //path fix on site move
            //    $zip->addFile(WP_CONTENT_DIR . end($tmp = explode("wp-content", $file)), wpdm_basename($file));
        }
        $zip->close();

        return $zipped;
    }

    /**
     * Cache remote file to local directory and return local file path
     * @param mixed $url
     * @param mixed $filename
     * @return string $path
     */
    public static function copyURL($url, $filename = '', $overwrite = true){
        $filename = $filename ? $filename : end($tmp = explode('/', $url));
        $path = WPDM_CACHE_DIR . $filename;
        if(file_exists($path) && !$overwrite) return $path;
        $fp = fopen($path, 'w');
        if(!function_exists('curl_init')) \WPDM_Messages::Error('<b>cURL</b> is not active or installed or not functioning properly in your server',1);
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_FILE, $fp);
        $data = curl_exec($ch);
        curl_close($ch);
        fclose($fp);
        return $path;
    }

    /**
     * @param $dir
     * @param bool|true $recur
     * @return array
     */
    public static function scanDir($dir, $recur = true, $abspath = true){
        $dir = realpath($dir)."/";
        if($dir == '/' || $dir == '') return array();
        $tmpfiles = file_exists($dir)?array_diff( scandir( $dir ), array( ".", ".." ) ):array();
        $files = array();
        foreach($tmpfiles as $file){
            if( is_dir($dir.$file) && $recur == true) $files = array_merge($files, self::scanDir($dir.$file, true));
            else
                $files[] = $abspath?$dir.$file:$file;
        }
        return $files;
    }

    /**
     * @param $dir
     * @param bool|true $recur
     * @return array
     */
    public static function listFiles($dir, $recur = true, $abspath = true){
        $dir = realpath($dir)."/";
        if($dir == '/' || $dir == '') return array();
        $tmpfiles = file_exists($dir)?array_diff( scandir( $dir ), array( ".", ".." ) ):array();
        $files = array();
        foreach($tmpfiles as $file){
            if( is_dir($dir.$file) && $recur == true) $files = array_merge($files, self::scanDir($dir.$file, true));
            else if(!is_dir($dir.$file))
                $files[] = $abspath?$dir.$file:$file;
        }
        return $files;
    }

    /**
     * @param $dir
     * @param bool|true $recur
     * @return array
     */
    public static function subDirs($dir, $abspath = true){
        $dir = realpath($dir)."/";
        if($dir == '/' || $dir == '') return array();
        $tmpfiles = file_exists($dir)?array_diff( scandir( $dir ), array( ".", ".." ) ):array();
        $subdirs = array();
        foreach($tmpfiles as $file){
            if( is_dir($dir.$file)) $subdirs[] = $abspath?$dir.$file:$file;

        }
        return $subdirs;
    }


    /**
     * @param $dir
     * @param bool|true $recur
     * @return array|bool
     */
    public static function deleteFiles($dir, $recur = true){
        $dir = realpath($dir)."/";
        if($dir == '/' || $dir == '') return array();
        $tmpfiles = file_exists($dir)?array_diff( scandir( $dir ), array( ".", ".." ) ):array();
        $files = array();
        foreach($tmpfiles as $file){
            if( is_dir($dir.$file) && $recur == true) $files = array_merge($files, self::scanDir($dir.$file, true));
            else
                @unlink($dir.$file);
        }
        return true;
    }



    public static function imageThumbnail($path, $width, $height, $crop = true, $usecache = true){
        $opath = $path;
        $abspath = str_replace("\\","/", ABSPATH);
        $cachedir = str_replace("\\","/", WPDM_CACHE_DIR);
        $path = str_replace("\\","/", $path);
        if(is_ssl()) $path = str_replace("http://","https://", $path);
        else  $path = str_replace("https://","http://", $path);
        $path = str_replace(site_url('/'), $abspath, $path);

        if(strpos($path, '.wp.com')) {
            $path = explode("?", $path);
            $path = $path[0]."?resize={$width},{$height}";
            return $path;
        }
        if(strpos($path, '://')) return $path;

        if (!file_exists($path)) return WPDM_BASE_URL.'assets/images/404.jpg';
        //if (!file_exists($path) && strstr($opath, "://")) return $opath;

        $name_p = explode(".", $path);
        $ext = "." . end($name_p);
        $filename = basename($path);
        $thumbpath = $cachedir . str_replace($ext, "-{$width}x{$height}" . $ext, $filename);
        if (file_exists($thumbpath) && $usecache) {
            $thumbpath = str_replace($abspath, site_url('/'), $thumbpath);
            return $thumbpath;
        }
        $image = wp_get_image_editor($path);
        $fullurl = str_replace(ABSPATH, home_url('/'), $path);
        if (!is_wp_error($image)) {
            //if ( is_wp_error( $image->resize( $width, $height, true ) ) ) return $fullurl;
            $image->resize( $width, $height, $crop );
            $image->save($thumbpath);
        }
        $thumbpath = str_replace("\\","/", $thumbpath);
        $thumbpath = str_replace($abspath, site_url('/'), $thumbpath);

        return $thumbpath;
    }

    /**
     * @param $pdf
     * @param $id
     * @return string
     * @usage Generates thumbnail from PDF file. [ From v4.1.3 ]
     */
    public static function pdfThumbnail($pdf, $id){
        $pdfurl = '';
        if(strpos($pdf, "://")) { $pdfurl = $pdf; $pdf = str_replace(home_url('/'), ABSPATH, $pdf); }
        if($pdf == $pdfurl) return '';
        if(file_exists($pdf)) $source = $pdf;
        else $source = UPLOAD_DIR.$pdf;
        if(!file_exists(WPDM_CACHE_DIR. "/pdfthumbs/")) @mkdir(WPDM_CACHE_DIR. "/pdfthumbs/");
        $dest = WPDM_CACHE_DIR. "/pdfthumbs/{$id}.png";
        $durl = WPDM_BASE_URL."cache/pdfthumbs/{$id}.png";
        $ext = explode(".", $source);
        $ext = end($ext);
        if($ext!='pdf') return '';
        if(file_exists($dest)) return $durl;
        if(!file_exists($source))
            $source = utf8_encode($source);
        $source = $source.'[0]';
        if(!class_exists('Imagick')) return "Error: Imagick is not installed properly";
        try{
            $image = new \imagick($source);
            $image->setResolution( 800, 800 );
            $image->setImageFormat( "png" );
            $image->writeImage($dest);
        } catch(\Exception $e){
            return '';
        }
        return $durl;
    }

    /**
     * @usgae Block http access to a dir
     * @param $dir
     */
    public static function blockHTTPAccess($dir){
        $cont = "RewriteEngine On\r\n<Files *>\r\nDeny from all\r\n</Files>\r\n";
        @file_put_contents($dir . '/.htaccess', $cont);
    }

    /**
     * @usage Google Doc Preview Embed
     * @param $url
     * @return string
     */
    public static function docPreview($url, $ext = ''){
        if($ext == 'pdf')
            return '<iframe src="https://docs.google.com/viewer?url='.urlencode($url).'&embedded=true" width="100%" height="600" style="border: none;"></iframe>';
        else
            return '<iframe src="https://view.officeapps.live.com/op/view.aspx?src='.urlencode($url).'&embedded=true" width="100%" height="600" style="border: none;"></iframe>';


    }

    public static function fullPath($file, $pid){
        $post = get_post($pid);
        $user = get_user_by('id', $post->post_author);
        $user_upload_dir = UPLOAD_DIR . $user->user_login . '/';
        if (file_exists(UPLOAD_DIR . $file))
            $fullpath = UPLOAD_DIR . $file;
        else if (file_exists($user_upload_dir.$file))
            $fullpath = $user_upload_dir.$file;
        else if (file_exists($file))
            $fullpath = $file;
        else
            $fullpath = '';
        return $fullpath;
    }

    public static function mediaURL($pid, $fileID, $fileName = ''){
        if($fileName == '') {
            $files = \WPDM\Package::getFiles($pid);
            $fileName = wpdm_basename($files[$fileID]);
        }
        $key = uniqid();
        $exp = array('use' => 0, 'expire' => time()+30);
        update_post_meta($pid, "__wpdmkey_".$key, $exp);

        return home_url("/wpdm-media/{$pid}/{$fileID}/{$fileName}?_wpdmkey={$key}");
    }

    static function html2pdf($html_content, $pdf_file_name){

        $result = wp_remote_post("https://urlxpdf.herokuapp.com/api/render",
            array(
                'method' => 'POST',
                'timeout' => 45,
                'redirection' => 5,
                'httpversion' => '1.0',
                'blocking' => true,
                'body' => $html_content,
                'cookies' => array(),
                'headers' => array(
                    'Content-Type' => 'text/html'
                )
            )
        );

        self::downloadData($pdf_file_name, wp_remote_retrieve_body($result));
        die();
    }


}