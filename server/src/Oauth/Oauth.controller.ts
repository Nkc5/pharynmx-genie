import { Controller, Get, Post, Res, Req } from '@nestjs/common';
import { Response, Request } from 'express';
import { OAuth2Client } from 'google-auth-library';

@Controller('auth')
export class OauthController {
  private readonly oAuth2Client;

  constructor() {
    this.oAuth2Client = new OAuth2Client(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      process.env.REDIRECT_URL,
    );
  }

  @Post('/user')
  async GetToken(@Res() res: Response) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');

    // Generate the url that will be used for the consent dialog.
    const authorizeUrl = this.oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope:
        'https://www.googleapis.com/auth/userinfo.profile  openid https://www.googleapis.com/auth/drive ',
      prompt: 'consent',
    });

    console.log('url', authorizeUrl);

    res.json({ url: authorizeUrl });
  }

  @Get('/callback')
  async oauthCallback(@Res() res: Response, @Req() req: Request) {
    const code = req.query.code;

    console.log('query', req.query);

    try {
      const r = await this.oAuth2Client.getToken(code);
      console.log('Token', r);

      // Make sure to set the credentials on the OAuth2 client.
      await this.oAuth2Client.setCredentials(r.tokens);

      const user = this.oAuth2Client.credentials;
      console.log('credentials', user);
      return res.send(user);
    } catch (err) {
      console.log('Error logging in with OAuth2 user', err.message);
      return res.send(err.message);
    }

    res.redirect(303, 'http://localhost:3000/');
  }
}
