// 이메일 템플릿 서비스

export interface EmailTemplate {
    subject: string;
    html: string;
    text: string;
}

export class EmailTemplates {
    /**
     * 비밀번호 재설정 이메일 템플릿
     */
    static passwordReset(email: string, resetToken: string, baseUrl: string): EmailTemplate {
        const resetLink = `${baseUrl}/finalmessage/reset-password?token=${resetToken}`;
        
        return {
            subject: 'FinalMessage - 비밀번호 재설정 요청',
            html: `
                <!DOCTYPE html>
                <html lang="ko">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>비밀번호 재설정</title>
                    <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
                        .container { max-width: 600px; margin: 0 auto; background-color: white; }
                        .header { background: linear-gradient(135deg, #0ea5e9, #3b82f6); padding: 40px 20px; text-align: center; }
                        .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
                        .content { padding: 40px 30px; }
                        .message { font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 30px; }
                        .button { display: inline-block; background: #0ea5e9; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
                        .button:hover { background: #0284c7; }
                        .warning { background-color: #fef3c7; border: 1px solid #f59e0b; padding: 16px; border-radius: 6px; margin: 20px 0; }
                        .warning-text { color: #92400e; font-size: 14px; }
                        .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 14px; color: #6b7280; }
                        .link { color: #0ea5e9; word-break: break-all; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔐 FinalMessage</h1>
                        </div>
                        <div class="content">
                            <h2 style="color: #1f2937; margin-top: 0;">비밀번호 재설정 요청</h2>
                            <div class="message">
                                <p>안녕하세요,</p>
                                <p><strong>${email}</strong> 계정의 비밀번호 재설정을 요청하셨습니다.</p>
                                <p>아래 버튼을 클릭하여 새 비밀번호를 설정하세요:</p>
                            </div>
                            
                            <div style="text-align: center;">
                                <a href="${resetLink}" class="button">비밀번호 재설정하기</a>
                            </div>
                            
                            <div class="warning">
                                <div class="warning-text">
                                    <strong>⚠️ 보안 안내</strong><br>
                                    • 이 링크는 24시간 후 만료됩니다<br>
                                    • 본인이 요청하지 않았다면 이 이메일을 무시하세요<br>
                                    • 링크를 다른 사람과 공유하지 마세요
                                </div>
                            </div>
                            
                            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                                버튼이 작동하지 않으면 아래 링크를 복사하여 브라우저에 붙여넣으세요:<br>
                                <a href="${resetLink}" class="link">${resetLink}</a>
                            </p>
                        </div>
                        <div class="footer">
                            <p>이 이메일은 FinalMessage 시스템에서 자동 발송되었습니다.</p>
                            <p>문의사항이 있으시면 고객지원팀으로 연락해주세요.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
FinalMessage - 비밀번호 재설정 요청

안녕하세요,

${email} 계정의 비밀번호 재설정을 요청하셨습니다.

아래 링크를 클릭하여 새 비밀번호를 설정하세요:
${resetLink}

⚠️ 보안 안내:
- 이 링크는 24시간 후 만료됩니다
- 본인이 요청하지 않았다면 이 이메일을 무시하세요
- 링크를 다른 사람과 공유하지 마세요

문의사항이 있으시면 고객지원팀으로 연락해주세요.

FinalMessage 팀
            `
        };
    }

    /**
     * 이메일 인증 코드 템플릿
     */
    static emailVerification(email: string, verificationCode: string): EmailTemplate {
        return {
            subject: 'FinalMessage - 이메일 인증 코드',
            html: `
                <!DOCTYPE html>
                <html lang="ko">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>이메일 인증</title>
                    <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
                        .container { max-width: 600px; margin: 0 auto; background-color: white; }
                        .header { background: linear-gradient(135deg, #10b981, #059669); padding: 40px 20px; text-align: center; }
                        .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
                        .content { padding: 40px 30px; text-align: center; }
                        .code-box { background-color: #f8fafc; border: 2px solid #e5e7eb; border-radius: 12px; padding: 30px; margin: 30px 0; }
                        .verification-code { font-size: 36px; font-weight: bold; color: #10b981; letter-spacing: 4px; margin: 0; font-family: 'Courier New', monospace; }
                        .message { font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 20px; }
                        .warning { background-color: #fef3c7; border: 1px solid #f59e0b; padding: 16px; border-radius: 6px; margin: 20px 0; }
                        .warning-text { color: #92400e; font-size: 14px; }
                        .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 14px; color: #6b7280; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>✅ FinalMessage</h1>
                        </div>
                        <div class="content">
                            <h2 style="color: #1f2937; margin-top: 0;">이메일 인증 코드</h2>
                            <div class="message">
                                <p>안녕하세요,</p>
                                <p><strong>${email}</strong>의 이메일 인증을 위한 코드입니다.</p>
                                <p>아래 인증 코드를 입력해주세요:</p>
                            </div>
                            
                            <div class="code-box">
                                <p class="verification-code">${verificationCode}</p>
                            </div>
                            
                            <div class="warning">
                                <div class="warning-text">
                                    <strong>⏰ 중요 안내</strong><br>
                                    • 이 코드는 5분 후 만료됩니다<br>
                                    • 코드는 한 번만 사용 가능합니다<br>
                                    • 본인이 요청하지 않았다면 이 이메일을 무시하세요
                                </div>
                            </div>
                            
                            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                                코드가 만료되었다면 새로운 인증 코드를 요청해주세요.
                            </p>
                        </div>
                        <div class="footer">
                            <p>이 이메일은 FinalMessage 시스템에서 자동 발송되었습니다.</p>
                            <p>문의사항이 있으시면 고객지원팀으로 연락해주세요.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
FinalMessage - 이메일 인증 코드

안녕하세요,

${email}의 이메일 인증을 위한 코드입니다.

인증 코드: ${verificationCode}

⏰ 중요 안내:
- 이 코드는 5분 후 만료됩니다
- 코드는 한 번만 사용 가능합니다
- 본인이 요청하지 않았다면 이 이메일을 무시하세요

코드가 만료되었다면 새로운 인증 코드를 요청해주세요.

FinalMessage 팀
            `
        };
    }

    /**
     * 검증자 알림 이메일 템플릿
     */
    static verifierNotification(verifierName: string, userName: string, verificationLink: string): EmailTemplate {
        return {
            subject: `FinalMessage - ${userName}님의 유산 메시지 검증 요청`,
            html: `
                <!DOCTYPE html>
                <html lang="ko">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>유산 메시지 검증 요청</title>
                    <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
                        .container { max-width: 600px; margin: 0 auto; background-color: white; }
                        .header { background: linear-gradient(135deg, #7c3aed, #a855f7); padding: 40px 20px; text-align: center; }
                        .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
                        .content { padding: 40px 30px; }
                        .message { font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 30px; }
                        .button { display: inline-block; background: #7c3aed; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
                        .button:hover { background: #6d28d9; }
                        .info-box { background-color: #f0f9ff; border: 1px solid #0ea5e9; padding: 20px; border-radius: 8px; margin: 20px 0; }
                        .info-text { color: #075985; font-size: 14px; }
                        .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 14px; color: #6b7280; }
                        .urgent { color: #dc2626; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>📋 FinalMessage</h1>
                        </div>
                        <div class="content">
                            <h2 style="color: #1f2937; margin-top: 0;">유산 메시지 검증 요청</h2>
                            <div class="message">
                                <p>안녕하세요 <strong>${verifierName}</strong>님,</p>
                                <p><strong>${userName}</strong>님의 검증자로 등록되어 있으시며, 검증 요청이 도착했습니다.</p>
                                <p class="urgent">이는 중요한 요청입니다. ${userName}님이 설정한 비활성 기간이 만료되어 자동으로 발송된 메시지입니다.</p>
                            </div>
                            
                            <div class="info-box">
                                <div class="info-text">
                                    <strong>📌 검증 절차</strong><br>
                                    1. 아래 링크를 클릭하여 검증 페이지로 이동<br>
                                    2. 본인 확인 및 검증 완료<br>
                                    3. ${userName}님의 유산 메시지가 안전하게 전달됩니다
                                </div>
                            </div>
                            
                            <div style="text-align: center;">
                                <a href="${verificationLink}" class="button">검증하기</a>
                            </div>
                            
                            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                                이 검증 요청은 시간 제한이 있습니다. 가능한 한 빠른 시일 내에 처리해주시기 바랍니다.
                            </p>
                            
                            <p style="font-size: 14px; color: #6b7280;">
                                검증자 역할에 대한 문의나 도움이 필요하시면 고객지원팀으로 연락해주세요.
                            </p>
                        </div>
                        <div class="footer">
                            <p>이 이메일은 FinalMessage 시스템에서 자동 발송되었습니다.</p>
                            <p>검증자로서의 중요한 역할에 감사드립니다.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
FinalMessage - ${userName}님의 유산 메시지 검증 요청

안녕하세요 ${verifierName}님,

${userName}님의 검증자로 등록되어 있으시며, 검증 요청이 도착했습니다.

이는 중요한 요청입니다. ${userName}님이 설정한 비활성 기간이 만료되어 자동으로 발송된 메시지입니다.

📌 검증 절차:
1. 아래 링크를 클릭하여 검증 페이지로 이동
2. 본인 확인 및 검증 완료
3. ${userName}님의 유산 메시지가 안전하게 전달됩니다

검증 링크: ${verificationLink}

이 검증 요청은 시간 제한이 있습니다. 가능한 한 빠른 시일 내에 처리해주시기 바랍니다.

검증자 역할에 대한 문의나 도움이 필요하시면 고객지원팀으로 연락해주세요.

검증자로서의 중요한 역할에 감사드립니다.

FinalMessage 팀
            `
        };
    }

    /**
     * 계정 보안 알림 템플릿
     */
    static securityAlert(email: string, activity: string, ipAddress: string, timestamp: string): EmailTemplate {
        return {
            subject: 'FinalMessage - 계정 보안 알림',
            html: `
                <!DOCTYPE html>
                <html lang="ko">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>보안 알림</title>
                    <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
                        .container { max-width: 600px; margin: 0 auto; background-color: white; }
                        .header { background: linear-gradient(135deg, #dc2626, #ef4444); padding: 40px 20px; text-align: center; }
                        .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
                        .content { padding: 40px 30px; }
                        .message { font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 30px; }
                        .alert-box { background-color: #fef2f2; border: 2px solid #dc2626; padding: 20px; border-radius: 8px; margin: 20px 0; }
                        .alert-text { color: #dc2626; }
                        .details { background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 15px 0; font-size: 14px; }
                        .button { display: inline-block; background: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
                        .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 14px; color: #6b7280; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🚨 FinalMessage</h1>
                        </div>
                        <div class="content">
                            <h2 style="color: #1f2937; margin-top: 0;">계정 보안 알림</h2>
                            <div class="message">
                                <p>안녕하세요,</p>
                                <p><strong>${email}</strong> 계정에서 다음과 같은 활동이 감지되었습니다:</p>
                            </div>
                            
                            <div class="alert-box">
                                <div class="alert-text">
                                    <strong>⚠️ 보안 활동 감지</strong><br>
                                    활동: ${activity}
                                </div>
                            </div>
                            
                            <div class="details">
                                <strong>세부 정보:</strong><br>
                                • 시간: ${timestamp}<br>
                                • IP 주소: ${ipAddress}<br>
                                • 활동: ${activity}
                            </div>
                            
                            <p>본인의 활동이 아니라면 즉시 다음 조치를 취해주세요:</p>
                            <ul>
                                <li>비밀번호 변경</li>
                                <li>2단계 인증 활성화</li>
                                <li>계정 활동 검토</li>
                            </ul>
                            
                            <div style="text-align: center;">
                                <a href="#" class="button">계정 보안 설정</a>
                            </div>
                        </div>
                        <div class="footer">
                            <p>계정 보안에 대한 문의는 고객지원팀으로 연락해주세요.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
FinalMessage - 계정 보안 알림

안녕하세요,

${email} 계정에서 다음과 같은 활동이 감지되었습니다:

⚠️ 보안 활동 감지
활동: ${activity}

세부 정보:
• 시간: ${timestamp}
• IP 주소: ${ipAddress}
• 활동: ${activity}

본인의 활동이 아니라면 즉시 다음 조치를 취해주세요:
- 비밀번호 변경
- 2단계 인증 활성화
- 계정 활동 검토

계정 보안에 대한 문의는 고객지원팀으로 연락해주세요.

FinalMessage 팀
            `
        };
    }

    /**
     * 웰컴 이메일 템플릿
     */
    static welcome(userName: string, email: string): EmailTemplate {
        return {
            subject: 'FinalMessage에 오신 것을 환영합니다! 🎉',
            html: `
                <!DOCTYPE html>
                <html lang="ko">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>환영합니다</title>
                    <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
                        .container { max-width: 600px; margin: 0 auto; background-color: white; }
                        .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px 20px; text-align: center; }
                        .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
                        .content { padding: 40px 30px; }
                        .message { font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 30px; }
                        .feature { background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #6366f1; }
                        .button { display: inline-block; background: #6366f1; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
                        .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 14px; color: #6b7280; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎉 FinalMessage</h1>
                        </div>
                        <div class="content">
                            <h2 style="color: #1f2937; margin-top: 0;">환영합니다, ${userName}님!</h2>
                            <div class="message">
                                <p>FinalMessage에 가입해주셔서 감사합니다.</p>
                                <p>소중한 메시지를 안전하게 보관하고 사랑하는 사람들에게 전달하는 여정을 함께 시작해보세요.</p>
                            </div>
                            
                            <h3 style="color: #1f2937;">주요 기능 안내</h3>
                            
                            <div class="feature">
                                <strong>🔐 블록체인 보안</strong><br>
                                메시지가 블록체인에 안전하게 저장되어 변조 불가능한 보안을 제공합니다.
                            </div>
                            
                            <div class="feature">
                                <strong>👥 검증자 시스템</strong><br>
                                신뢰할 수 있는 검증자들이 적절한 시점에 메시지를 전달합니다.
                            </div>
                            
                            <div class="feature">
                                <strong>🕒 자동 트리거</strong><br>
                                설정한 조건에 따라 자동으로 메시지가 전달됩니다.
                            </div>
                            
                            <div style="text-align: center;">
                                <a href="#" class="button">첫 메시지 작성하기</a>
                            </div>
                            
                            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                                궁금한 점이 있으시면 언제든 고객지원팀으로 연락해주세요.
                            </p>
                        </div>
                        <div class="footer">
                            <p>다시 한 번 FinalMessage 가족이 되어주셔서 감사합니다.</p>
                            <p>소중한 순간들을 함께 지켜나가겠습니다.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
FinalMessage에 오신 것을 환영합니다! 🎉

환영합니다, ${userName}님!

FinalMessage에 가입해주셔서 감사합니다.
소중한 메시지를 안전하게 보관하고 사랑하는 사람들에게 전달하는 여정을 함께 시작해보세요.

주요 기능 안내:

🔐 블록체인 보안
메시지가 블록체인에 안전하게 저장되어 변조 불가능한 보안을 제공합니다.

👥 검증자 시스템
신뢰할 수 있는 검증자들이 적절한 시점에 메시지를 전달합니다.

🕒 자동 트리거
설정한 조건에 따라 자동으로 메시지가 전달됩니다.

궁금한 점이 있으시면 언제든 고객지원팀으로 연락해주세요.

다시 한 번 FinalMessage 가족이 되어주셔서 감사합니다.
소중한 순간들을 함께 지켜나가겠습니다.

FinalMessage 팀
            `
        };
    }
}