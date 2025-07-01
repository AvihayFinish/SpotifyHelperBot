# 🎧 SpotifyHelper Bot

SpotifyHelper is a smart WhatsApp bot that allows users to follow their favorite podcasts and topics. The bot uses Twilio for messaging, OpenAI to analyze podcast episodes, and the Spotify API to fetch podcast data.

---

## 🚀 Features

- Add or remove podcasts and topics of interest.
- Get real-time notifications when new episodes match followed topics.
- Analyze podcast content using GPT-4o to detect relevant topics.
- Simple WhatsApp interface via Twilio.
- Scheduled daily checks for new episodes with `node-cron`.

---

## 🧰 Tech Stack

- **Node.js + Express** – Web server
- **PostgreSQL** – Database
- **Twilio API** – WhatsApp messaging
- **Spotify API** – Podcast and episode data
- **OpenAI GPT-4o** – Content analysis
- **Ngrok** – Exposes local server for Twilio + Spotify callbacks
- **node-cron** – Job scheduler

---

## ⚙️ Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/spotify-helper.git
cd spotify-helper
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory and fill it with:

```
PORT=8000
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/<database>
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=https://<your-ngrok-subdomain>.ngrok-free.app/spotifyHelper/bot/callback
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=whatsapp:+14155238886
OPENAI_API_KEY=your_openai_api_key
```

4. **Run Ngrok to expose your local server**
```bash
ngrok http 8000
```
Update the `SPOTIFY_REDIRECT_URI` with the generated URL.

5. **Start the server** <br>
For production -
```bash
npm start
```
For development(with nodemon) -
```bash
npm run server
```

---

## 🧪 Testing

To test the bot, send a WhatsApp message to your Twilio number from your verified phone. You should receive a reply based on your input.

To manually test the scheduled job, invoke the `checkEpisodes()` function directly or trigger the cron job if configured.

---

## 📁 Project Structure

```
spotify-helper/
│
├── backend/
│   ├── controllers/
│   ├── jobs/
│   ├── routers/
│   ├── services/
│   ├── utils/
│   ├── midllewares/
│   └── index.js
│
├── .env
├── package.json
└── README.md
```
## ✅ Understand the topics here

- [Spotify App](https://developer.spotify.com/documentation/web-api/concepts/apps)
- [Spotify API](https://developer.spotify.com/documentation/web-api/concepts/api-calls)
- [Twilio API](https://www.twilio.com/docs)
