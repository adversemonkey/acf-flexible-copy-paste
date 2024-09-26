<?php

    /*
    Plugin Name: ACF Flexible Copy & Paste
    Plugin URI:
    Description:
    Version: 1
    Author: Alessandro Monopoli
    Author URI:
    Disclaimer:
    Text Domain:
    License: GPLv2 or later
    */

    /*
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
    */

    // If this file is called directly, abort.
    if ( ! defined( 'WPINC' ) ) {
        die;
    }

    function ACFCP_include_assets() {
        wp_register_script( 'ACFCP_scripts', 	plugins_url( 'ACFCP_scripts.js', __FILE__ ), array(), time(), 'all' );
        wp_enqueue_script( 'ACFCP_scripts' );
        wp_localize_script('ACFCP_scripts', 'ACFCP_settings', [
            'nonce' => wp_create_nonce('wp_rest'),
        ]);

        wp_register_style( 'ACFCP_styles', plugins_url( 'ACFCP_styles.css', __FILE__ ) );
        wp_enqueue_style( 'ACFCP_styles' ); 
    }

    // includo assets
    add_action( 'admin_enqueue_scripts', 'ACFCP_include_assets', 201 );
    