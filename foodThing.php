
        <?php
	    ini_set('display_errors',1);
	    error_reporting(E_ALL);
            /**
             * Yelp API v2.0 code sample.
             *
             * This program demonstrates the capability of the Yelp API version 2.0
             * by using the Search API to query for businesses by a search term and location,
             * and the Business API to query additional information about the top result
             * from the search query.
             * 
             * Please refer to http://www.yelp.com/developers/documentation for the API documentation.
             * 
             * This program requires a PHP OAuth2 library, which is included in this branch and can be
             * found here:
             *      http://oauth.googlecode.com/svn/code/php/
             * 
             * Sample usage of the program:
             * `php sample.php --term="bars" --location="San Francisco, CA"`
             */

            // Enter the path that the oauth library is in relation to the php file
            require_once('OAuth.php');

            // Set your OAuth credentials here  
            // These credentials can be obtained from the 'Manage API Access' page in the
            // developers documentation (http://www.yelp.com/developers)
            $CONSUMER_KEY = "4qXBU_6oLLIse9hfG3Iy3g";
            $CONSUMER_SECRET = "x6TZ3atMSZiLK04Fo7nHe28YUt4";
            $TOKEN = "QT3WOjE11nuy31lHZAVY3IjI-weI45l8";
            $TOKEN_SECRET = "gTG8yvp7km1p-7PvHKYFOwVqF8o";


            $API_HOST = 'api.yelp.com';
            $DEFAULT_TERM = 'food';
            $DEFAULT_LL = $_GET['latit'].','.$_GET["longit"];
            $SEARCH_PATH = '/v2/search/';
            $DEFAULT_MILES = 32000;


            /** 
             * Makes a request to the Yelp API and returns the response
             * 
             * @param    $host    The domain host of the API 
             * @param    $path    The path of the APi after the domain
             * @return   The JSON response from the request      
             */
            function request($host, $path) {
                $unsigned_url = "http://" . $host . $path;

                // Token object built using the OAuth library
                $token = new OAuthToken($GLOBALS['TOKEN'], $GLOBALS['TOKEN_SECRET']);

                // Consumer object built using the OAuth library
                $consumer = new OAuthConsumer($GLOBALS['CONSUMER_KEY'], $GLOBALS['CONSUMER_SECRET']);

                // Yelp uses HMAC SHA1 encoding
                $signature_method = new OAuthSignatureMethod_HMAC_SHA1();

                $oauthrequest = OAuthRequest::from_consumer_and_token(
                    $consumer, 
                    $token, 
                    'GET', 
                    $unsigned_url
                );
                
                // Sign the request
                $oauthrequest->sign_request($signature_method, $consumer, $token);
                
                // Get the signed URL
                $signed_url = $oauthrequest->to_url();
                
                // Send Yelp API Call
                $ch = curl_init($signed_url);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_HEADER, 0);
                $data = curl_exec($ch);
                curl_close($ch);
                
                return $data;
            }

            /**
             * Query the Search API by a search term and location 
             * 
             * @param    $term        The search term passed to the API 
             * @return   The JSON response from the request 
             */
            function search($term, $ll,$miles) {

                $url_params = array();
                
                $url_params['term'] = $term ?: $GLOBALS['DEFAULT_TERM'];
                $url_params['ll'] = $ll?: $GLOBALS['DEFAULT_LL'];
                $url_params['radius_filter'] = $miles?: $GLOBALS['DEFAULT_MILES'];
                $search_path = $GLOBALS['SEARCH_PATH'] . "?" . http_build_query($url_params);
                return request($GLOBALS['API_HOST'], $search_path);
            }

            /**
             * Query the Business API by business_id
             * 
             * @param    $business_id    The ID of the business to query
             * @return   The JSON response from the request 
             */

            /**
             * Queries the API by the input values from the user 
             * 
             * @param    $term        The search term to query
             * @param    $location    The location of the business to query
             */
            function query_api($term, $ll,$miles) {     
                $response = json_decode(search($term, $ll,$miles));
                echo (json_encode($response));
                
            }

            /**
             * User input is handled here 
             */
            $longopts  = array(
                "food",
                $DEFAULT_LL,
                $DEFAULT_MILES
            );
                
            $options = getopt("", $longopts);

            $term = $options['term'] ?: '';
            $ll = $options['ll'] ?: '';
            $miles = $options['miles'] ?: '';
            query_api($term, $ll, $miles);

            ?>
