
export const passwordResetOtpTemplate = (otp: string) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        .container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; }
        .header { background-color: #ff5722; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; text-align: center; color: #333; }
        .otp { font-size: 32px; font-weight: bold; color: #ff5722; letter-spacing: 5px; margin: 20px 0; padding: 15px; background-color: #fff5f0; border-radius: 5px; display: inline-block; }
        .footer { font-size: 12px; color: #777; text-align: center; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Bug Tracker</h1>
        </div>
        <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hello,</p>
            <p>We received a request to reset your Bug Tracker password. Use the following OTP to proceed. This code is valid for 5 minutes.</p>
            <div class="otp">${otp}</div>
            <p>If you didn't request a password reset, you can safely ignore this email.</p>
        </div>
        <div class="footer">
            <p>&copy; 2026 Bug Tracker. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;
