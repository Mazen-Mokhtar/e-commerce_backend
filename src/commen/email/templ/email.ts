export function generateOTPEmail(otp) {
    return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تأكيد OTP للتسوق</title>
    <style>
        body {
            font-family: 'Tajawal', sans-serif;
            background-color: #f8f9fa;
            margin: 0;
            padding: 0;
            direction: rtl;
        }
        .container {
            max-width: 650px;
            margin: 30px auto;
            background: linear-gradient(135deg, #ffffff 0%, #f1f4f8 100%);
            border-radius: 15px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
            overflow: hidden;
        }
        .header {
            background-color: #1a73e8;
            padding: 20px;
            text-align: center;
            position: relative;
        }
        .header img {
            max-width: 180px;
            filter: brightness(0) invert(1);
        }
        .cart-icon {
            position: absolute;
            top: 20px;
            left: 20px;
            width: 40px;
            height: 40px;
            background: url('https://img.icons8.com/ios-filled/50/ffffff/shopping-cart.png') no-repeat center;
            background-size: contain;
        }
        .content {
            padding: 30px;
            text-align: center;
        }
        h1 {
            color: #1a1a1a;
            font-size: 28px;
            margin: 0 0 15px;
            font-weight: 700;
        }
        p {
            color: #4a4a4a;
            font-size: 16px;
            line-height: 1.8;
            margin: 0 0 20px;
        }
        .otp-box {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background-color: #e8f0fe;
            border: 2px dashed #1a73e8;
            border-radius: 10px;
            padding: 15px 25px;
            font-size: 26px;
            font-weight: bold;
            color: #1a73e8;
            letter-spacing: 8px;
            margin: 20px 0;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .btn {
            display: inline-block;
            background: linear-gradient(90deg, #1a73e8, #34c759);
            color: #ffffff;
            padding: 14px 40px;
            text-decoration: none;
            border-radius: 50px;
            font-size: 18px;
            font-weight: 500;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
        }
        .footer {
            background-color: #f1f4f8;
            padding: 20px;
            font-size: 13px;
            color: #6b7280;
            text-align: center;
        }
        .footer a {
            color: #1a73e8;
            text-decoration: none;
            font-weight: 500;
        }
        .footer a:hover {
            text-decoration: underline;
        }
        @media only screen and (max-width: 600px) {
            .container {
                margin: 15px;
                border-radius: 10px;
            }
            .header {
                padding: 15px;
            }
            .header img {
                max-width: 140px;
            }
            .content {
                padding: 20px;
            }
            h1 {
                font-size: 22px;
            }
            .otp-box {
                font-size: 20px;
                padding: 10px 20px;
            }
            .btn {
                padding: 12px 30px;
                font-size: 16px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="cart-icon"></div>
            <img src="https://via.placeholder.com/180x60.png?text=Your+Logo" alt="Logo">
        </div>
        <div class="content">
            <h1>رمز التأكيد الخاص بك</h1>
            <p>مرحبًا! شكرًا لتسوقك معنا. استخدم رمز OTP التالي لتأكيد حسابك. الرمز صالح لمدة 10 دقائق فقط.</p>
            <div class="otp-box">${otp}</div>
            <p>أدخل هذا الرمز في صفحة التحقق لإكمال عملية التسجيل أو الشراء.</p>
            <a href="https://yourwebsite.com/verify" class="btn">تحقق الآن</a>
        </div>
        <div class="footer">
            <p>إذا لم تطلب هذا الرمز، يرجى تجاهل هذا البريد الإلكتروني أو تواصل معنا على <a href="mailto:support@yourwebsite.com">support@yourwebsite.com</a>.</p>
            <p>© 2025 Your E-Commerce. جميع الحقوق محفوظة.</p>
        </div>
    </div>
</body>
</html>
    `;
}