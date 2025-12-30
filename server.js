const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// USIAMO IL MODELLO STANDARD "gemini-pro"
// NOTA: Togliamo systemInstruction da qui perché gemini-pro non lo supporta così.
const model = genAI.getGenerativeModel({ 
    model: "gemini-pro" 
});

const systemPrompt = `
Sei l'assistente virtuale dell'Hotel Jonio, situato a Lido di Noto, Sicilia.
Il tuo tono deve essere: accogliente, professionale e sintetico.
Rispondi sempre in italiano o nella lingua dell'utente.
Se chiedono disponibilità o prezzi, invitali a cliccare su "Prenota" o chiamare.
`;

app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    // TRUCCO: Uniamo le istruzioni al messaggio dell'utente manualmene
    // Questo funziona con QUALSIASI modello, anche i più vecchi.
    const fullMessage = systemPrompt + "\n\nUtente: " + message;

    const result = await model.generateContent(fullMessage);
    const response = await result.response;
    
    res.json({ reply: response.text() });
  } catch (error) {
    console.error("Errore Gemini:", error);
    res.status(500).json({
      reply: "Scusa, ho un problema tecnico. Riprova più tardi."
    });
  }
});

app.listen(port, () => {
  console.log(`Server attivo su porta ${port}`);
});
