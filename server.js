const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const systemPrompt = `
Sei l'assistente virtuale dell'Hotel Jonio, situato a Lido di Noto, Sicilia.
Il tuo tono deve essere: accogliente, professionale e sintetico.

INFORMAZIONI HOTEL JONIO:
- Posizione: Viale Lido 1, Marina di Noto (SR), fronte mare.
- Camere:
  1. Classic: vista mare parziale, balcone.
  2. Comfort: vista mare laterale, balcone.
  3. Superior: Fronte Mare (scelta top), balcone.
- Servizi inclusi: Colazione, Wi-Fi, Parcheggio, Ascensore.
- Ristorante: Cucina tipica siciliana, pesce fresco, vini dell'Etna.
- Bar: Lounge bar con aperitivi.
- Animali: Pet Friendly (con supplemento).
- Contatti: Tel +39 0931.812040, Email hoteljonio@hotmail.com.

REGOLE:
1. Se chiedono disponibilità date o prezzi precisi, dì che non hai il calendario e invita a usare il tasto "Prenota" o a chiamare.
2. Rispondi nella lingua dell'utente.
`;

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: systemPrompt
});

app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "No message provided" });
    }

    const chat = model.startChat({ history: [] });
    const result = await chat.sendMessage(message);

    res.json({ reply: result.response.text() });
  } catch (error) {
    console.error("Errore Gemini:", error);
    res.status(500).json({
      reply: "Scusa, ho un problema tecnico momentaneo. Contattaci telefonicamente."
    });
  }
});

app.listen(port, () => {
  console.log(`Server attivo su porta ${port}`);
});
