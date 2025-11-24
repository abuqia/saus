<!DOCTYPE html>
<html>
<head>
    <title>{{ $subject }}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 5px; }
        .content { padding: 20px 0; white-space: pre-line; }
        .footer { border-top: 1px solid #eee; padding-top: 20px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Hello {{ $userName }},</h2>
        </div>

        <div class="content">
            {{ $content }}
        </div>

        <div class="footer">
            <p>Best regards,<br>{{ config('app.name') }} Team</p>
        </div>
    </div>
</body>
</html>
