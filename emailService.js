// emailService.js
const sgMail = require('@sendgrid/mail');

require('dotenv').config();

// Set up SendGrid with your API key from the environment variable
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Sends a welcome email to a newly registered user
 * @param {string} to - The recipient's email address
 * @param {string} userName - The name of the user
 */
const sendRegistrationEmail = async (to, userName, password) => {
    const homepageLink = `${process.env.APP_URL || 'https://eugenekrokhmal.github.io/tripper-frontend'}/`; // Replace with actual homepage URL

    const msg = {
        to, // Recipient's email address
        from: 'krokhmaleugen@gmail.com', // Your verified SendGrid sender email address
        subject: 'WELCOME TO TRIPPER',
        html: `<!--
* This email was built using Tabular.
* For more information, visit https://tabular.email
-->
<!DOCTYPE html
    PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
    xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">

<head>
    <title></title>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <!--[if !mso]>-->
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <!--<![endif]-->
    <meta name="x-apple-disable-message-reformatting" content="" />
    <meta content="target-densitydpi=device-dpi" name="viewport" />
    <meta content="true" name="HandheldFriendly" />
    <meta content="width=device-width" name="viewport" />
    <meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no" />
    <style type="text/css">
        table {
            border-collapse: separate;
            table-layout: fixed;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt
        }

        table td {
            border-collapse: collapse
        }

        .ExternalClass {
            width: 100%
        }

        .ExternalClass,
        .ExternalClass p,
        .ExternalClass span,
        .ExternalClass font,
        .ExternalClass td,
        .ExternalClass div {
            line-height: 100%
        }

        body,
        a,
        li,
        p,
        h1,
        h2,
        h3 {
            -ms-text-size-adjust: 100%;
            -webkit-text-size-adjust: 100%;
        }

        html {
            -webkit-text-size-adjust: none !important
        }

        body,
        #innerTable {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale
        }

        #innerTable img+div {
            display: none;
            display: none !important
        }

        img {
            Margin: 0;
            padding: 0;
            -ms-interpolation-mode: bicubic
        }

        h1,
        h2,
        h3,
        p,
        a {
            line-height: inherit;
            overflow-wrap: normal;
            white-space: normal;
            word-break: break-word
        }

        a {
            text-decoration: none
        }

        h1,
        h2,
        h3,
        p {
            min-width: 100% !important;
            width: 100% !important;
            max-width: 100% !important;
            display: inline-block !important;
            border: 0;
            padding: 0;
            margin: 0
        }

        a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important
        }

        u+#body a {
            color: inherit;
            text-decoration: none;
            font-size: inherit;
            font-family: inherit;
            font-weight: inherit;
            line-height: inherit;
        }

        a[href^="mailto"],
        a[href^="tel"],
        a[href^="sms"] {
            color: inherit;
            text-decoration: none
        }
    </style>
    <style type="text/css">
        @media (min-width: 481px) {
            .hd {
                display: none !important
            }
        }
    </style>
    <style type="text/css">
        @media (max-width: 480px) {
            .hm {
                display: none !important
            }
        }
    </style>
    <style type="text/css">
        @media (max-width: 480px) {
            .t1 {
                padding-top: 0 !important;
                width: 480px !important
            }

            .t12,
            .t14,
            .t4,
            .t7 {
                width: 420px !important
            }

            .t12 {
                background-color: #f7f7f7 !important;
                padding: 40px 30px !important
            }

            .t9 {
                color: #f7f7f7 !important
            }

            .t4 {
                padding-bottom: 20px !important
            }

            .t3 {
                line-height: 28px !important;
                font-size: 26px !important;
                letter-spacing: -1.04px !important;
                color: #1a1a1a !important
            }

            .t14 {
                padding: 40px 30px !important
            }
        }
    </style>
    <!--[if !mso]>-->
    <link href="https://fonts.googleapis.com/css2?family=Albert+Sans:wght@500;800&amp;display=swap" rel="stylesheet"
        type="text/css" />
    <!--<![endif]-->
    <!--[if mso]>
<xml>
<o:OfficeDocumentSettings>
<o:AllowPNG/>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
<![endif]-->
</head>

<body id="body" class="t18" style="min-width:100%;Margin:0px;padding:0px;background-color:#242424;">
    <div class="t17" style="background-color:#242424;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center">
            <tr>
                <td class="t16" style="font-size:0;line-height:0;mso-line-height-rule:exactly;background-color:#242424;"
                    valign="top" align="center">
                    <!--[if mso]>
<v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false">
<v:fill color="#242424"/>
</v:background>
<![endif]-->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
                        id="innerTable">
                        <tr>
                            <td align="center">
                                <table class="t2" role="presentation" cellpadding="0" cellspacing="0"
                                    style="Margin-left:auto;Margin-right:auto;">
                                    <tr>
                                        <!--[if mso]>
<td width="600" class="t1" style="padding:48px 0 0 0;">
<![endif]-->
                                        <!--[if !mso]>-->
                                        <td class="t1" style="width:600px;padding:48px 0 0 0;">
                                            <!--<![endif]-->
                                            <div style="font-size:0px;"><img class="t0"
                                                    style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;"
                                                    width="600" height="401.25" alt=""
                                                    src="https://8486e2b6-284e-405d-9bb3-e10807f348c6.b-cdn.net/e/437ae0a1-ea78-4c33-af9f-1c68d83614a8/b14a60e2-1fde-4b15-90d9-1c540f36e1e9.jpeg" />
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td align="center">
                                <table class="t13" role="presentation" cellpadding="0" cellspacing="0"
                                    style="Margin-left:auto;Margin-right:auto;">
                                    <tr>
                                        <!--[if mso]>
<td width="600" class="t12" style="background-color:#F8F8F8;padding:60px 50px 60px 50px;">
<![endif]-->
                                        <!--[if !mso]>-->
                                        <td class="t12"
                                            style="background-color:#F8F8F8;width:500px;padding:60px 50px 60px 50px;">
                                            <!--<![endif]-->
                                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                                                style="width:100% !important;">
                                                <tr>
                                                    <td align="center">
                                                        <table class="t5" role="presentation" cellpadding="0"
                                                            cellspacing="0" style="Margin-left:auto;Margin-right:auto;">
                                                            <tr>
                                                                <!--[if mso]>
<td width="500" class="t4" style="padding:0 0 25px 0;">
<![endif]-->
                                                                <!--[if !mso]>-->
                                                                <td class="t4" style="width:500px;padding:0 0 25px 0;">
                                                                    <!--<![endif]-->
                                                                    <p class="t6"
                                                                        style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px;">
                                                                        <strong>Hey, ${userName},</strong>
                                                                    </p>
                                                                    <h1 class="t3"
                                                                        style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:41px;font-weight:800;font-style:normal;font-size:39px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px;">
                                                                        Welcome to Tripper!</h1>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td align="center">
                                                        <table class="t8" role="presentation" cellpadding="0"
                                                            cellspacing="0" style="Margin-left:auto;Margin-right:auto;">
                                                            <tr>
                                                                <!--[if mso]>
<td width="500" class="t7" style="padding:0 0 22px 0;">
<![endif]-->
                                                                <!--[if !mso]>-->
                                                                <td class="t7" style="width:500px;padding:0 0 22px 0;">
                                                                    <!--<![endif]-->
                                                                    <p class="t6"
                                                                        style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px;">
                                                                        Discover and plan your perfect trip with
                                                                        Tripper! Organize your adventures with friends
                                                                        and family, split expenses, and create lifelong
                                                                        memories.</p>
                                                                    <p class="t6"
                                                                        style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px;">
                                                                        <strong>Your password is: ${password}</strong>
                                                                    </p>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td align="center">
                                                        <table class="t11" role="presentation" cellpadding="0"
                                                            cellspacing="0" style="Margin-left:auto;Margin-right:auto;">
                                                            <tr>
                                                                <!--[if mso]>
<td width="250" class="t10" style="background-color:#171717;overflow:hidden;text-align:center;line-height:44px;mso-line-height-rule:exactly;mso-text-raise:10px;border-radius:44px 44px 44px 44px;">
<![endif]-->
                                                                <!--[if !mso]>-->
                                                                <td class="t10"
                                                                    style="background-color:#171717;overflow:hidden;width:250px;text-align:center;line-height:44px;mso-line-height-rule:exactly;mso-text-raise:10px;border-radius:44px 44px 44px 44px;">
                                                                    <!--<![endif]-->
                                                                    <a class="t9" href="${homepageLink}/#/login"
                                                                        style="display:block;margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:44px;font-weight:800;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;letter-spacing:2.4px;direction:ltr;color:#F8F8F8;text-align:center;mso-line-height-rule:exactly;mso-text-raise:10px;"
                                                                        target="_blank">GO!</a>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td align="center">
                                <table class="t15" role="presentation" cellpadding="0" cellspacing="0"
                                    style="Margin-left:auto;Margin-right:auto;">
                                    <tr>
                                        <!--[if mso]>
<td width="600" class="t14" style="padding:48px 50px 48px 50px;">
<![endif]-->
                                        <!--[if !mso]>-->
                                        <td class="t14" style="width:500px;padding:48px 50px 48px 50px;">
                                            <!--<![endif]-->
                                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                                                style="width:100% !important;"></table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </div>
</body>

</html>`,
    };

    try {
        await sgMail.send(msg);
        console.log('Registration email sent successfully');
    } catch (error) {
        console.error('Error sending registration email:', error);
        if (error.response) {
            console.error(error.response.body); // Logs any specific SendGrid API errors
        }
    }
};

module.exports = { sendRegistrationEmail };
