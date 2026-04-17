import resend
from app.core.config import settings

resend.api_key = settings.RESEND_API_KEY


async def send_otp_email(to_email: str, otp: str, is_admin: bool = False) -> None:
    session_note = "30 дней" if is_admin else "24 часа"

    html = f"""
    <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; background: #0A0A0B; color: #FAFAFA; padding: 40px; border-radius: 12px; border: 1px solid #26262A;">
        <div style="margin-bottom: 32px;">
            <span style="font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">otzovik</span>
            <span style="color: #D1FF3C; font-size: 24px;">.</span>
        </div>
        <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 8px; color: #FAFAFA;">Ваш код входа</h2>
        <p style="color: #8A8A94; margin-bottom: 32px; font-size: 14px;">Введите этот код для входа в систему. Действует 10 минут.</p>
        <div style="background: #141416; border: 1px solid #26262A; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <span style="font-family: 'JetBrains Mono', monospace; font-size: 40px; font-weight: 700; letter-spacing: 12px; color: #D1FF3C;">{otp}</span>
        </div>
        <p style="color: #52525B; font-size: 12px;">Сессия будет активна {session_note}. Если вы не запрашивали код — проигнорируйте это письмо.</p>
    </div>
    """

    resend.Emails.send({
        "from": settings.SMTP_FROM,
        "to": [to_email],
        "subject": f"{otp} — код входа в otzovik",
        "html": html,
    })
