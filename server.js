const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Configurazione AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// --- ISTRUZIONI DI SISTEMA (VERSIONE SINTETICA) ---
const systemPrompt = `
SEI: Jo, l'assistente virtuale dell'Hotel Jonio a Lido di Noto.
OBIETTIVO: Risposte BREVI, VELOCI e DIRETTE (Massimo 3 frasi).
TONO: Simpatico, solare, accogliente, ma molto sintetico. Evita giri di parole.

REGOLA D'ORO: NON fare elenchi lunghi. Dai solo l'informazione richiesta e il pulsante giusto.

INFORMAZIONI ESSENZIALI:
- Posizione: Viale Lido 1, Marina di Noto (SR), fronte mare.
- Camere: Tutte con balcone. Classic (vista parziale), Comfort (laterale), Superior (fronte mare).
- Ristorante "RisJo": Cucina siciliana e pesce.
- Bar: Aperto 7:30-00:00.
- Spiaggia: Libera o lidi convenzionati di fronte (pagamento extra al lido).
- Parcheggio: Privato GRATIS.
- Animali: Benvenuti (contattare reception).
- Check-in/out: 15:00 / 11:00.

STRATEGIA PREZZI:
Se chiedono prezzi o preventivi, dì che variano e INVITA A PRENOTARE ONLINE o CONTATTARE per l'offerta migliore. Sii breve.

CODICI PULSANTI (OBBLIGATORI ALLA FINE DELLA RISPOSTA):
Usa questi codici ESATTI per far apparire i bottoni:

- Posizione: {{BUTTON:Apri Mappa|https://www.google.com/maps/search/?api=1&query=Hotel+Jonio+Lido+di+Noto}}
- Bar: {{BUTTON:Scopri il Bar|nav:bar}}
- Ristorante: {{BUTTON:Vai al Ristorante|nav:ristorante}}
- Camere (generale): {{BUTTON:Vedi le Camere|nav:camere}}
- Camera Superior: {{BUTTON:Guarda la Superior|nav:camere}}
- Camera Comfort: {{BUTTON:Guarda la Comfort|nav:camere}}
- Contatti/Animali/Info: {{BUTTON:Vai ai Contatti|nav:contatti}}
- Dintorni: {{BUTTON:Scopri i Dintorni|nav:dintorni}}
- Prenotazione/Prezzi: {{BUTTON:Calcola Preventivo|https://togo.hoteljonio.it/}}
- Chiamata: {{BUTTON:Chiama 0931.812040|tel:+390931812040}}

NOTA: Se l'utente saluta solo, rispondi al saluto brevemente senza mettere pulsanti, a meno che non chieda info.
`;

app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Messaggio vuoto" });

    // Costruiamo il prompt unendo istruzioni e messaggio utente
    const finalPrompt = `${systemPrompt}\n\nUTENTE: ${message}\nJO (Sii breve):`;

    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });

  } catch (error) {
    console.error("Errore server:", error);
    res.status(500).json({ reply: "Scusa, piccolo problema tecnico! Riprova tra un attimo." });
  }
});

app.listen(port, () => {
  console.log(`Server attivo su porta ${port}`);
});
