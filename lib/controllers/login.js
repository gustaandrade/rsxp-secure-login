const TotalVoice = require('totalvoice-node');
const Base64 = require('js-base64').Base64;
const userDb = require('../db/user.js');

class LoginController {
  emailLogin(req, res) {
    const totalvoiceClient = new TotalVoice('81b488b24c3958bb17616a607889cfec');
    const email = req.body.email;
    const password = req.body.password;
    const userInDatabase = userDb.getByLogin(email, password);

    if (userInDatabase == undefined)
      res.status(404).json({ message: 'Invalid credentials.' });

    const token = {
      type: '2fa-sent',
      userId: userInDatabase.id,
      email: userInDatabase.email,
      sign: '0123456789'
    }

    totalvoiceClient.verificacao.enviar(userInDatabase.phone, "app-top", 5, false)
    .then(data => {
      token.twoFactorVerificationId = data.dados.id;
      const base64Token = Base64.encode(JSON.stringify(token));
      res.json({ message: 'Authentication success, waiting 2FA validation!', token: base64Token });
    })
    .catch(error => {
      res.status(500).json({ message: 'Server error.' });
    })
  }

  verify2FA(req, res) {
    const totalvoiceClient = new TotalVoice('81b488b24c3958bb17616a607889cfec');
    const authorizationHeader = req.header("Authorization");
    const token = JSON.parse(Base64.decode(authorizationHeader));
    const userInDatabase = userDb.getById(token.userId);

    totalvoiceClient.verificacao.buscar(token.twoFactorVerificationId, req.body.pin)
    .then(data => {
      const permanentToken = {
        type: 'permanent',
        userId: userInDatabase.id,
        email: userInDatabase.email,
        sign: '0123456789'
      }
      const base64Token = Base64.encode(JSON.stringify(permanentToken));

      res.status(201).json({ message: 'Sucesso!', permanentToken: base64Token });
    })
  }
}

module.exports = new LoginController();
