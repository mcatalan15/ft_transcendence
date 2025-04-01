<?php
function adminer_object() {
	include_once "../plugins/login-password-less.php";

	class AdminerCustomization extends Adminer\Plugins {
		function loginFormField($name, $heading, $value) {
			return parent::loginFormField($name, $heading, str_replace('value="server"', 'value="sqlite"', $value));
		}
		function database() {
			return "/db/mydatabase.db";
		}
	}

	return new AdminerCustomization(array(
		// TODO: inline the result of password_hash() so that the password is not visible in source codes
		new AdminerLoginPasswordLess(password_hash("", PASSWORD_DEFAULT)),
	));
}

include "./index.php";