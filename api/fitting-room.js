export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { image, garment } = req.body;

  if (!image || !garment) {
    return res.status(400).json({ message: 'Missing image or garment name.' });
  }

  try {
    const prompt = `A luxury African fashion model wearing an elegant high-end Calufia garment, ${garment}, tailored, editorial photography, soft lighting, fashion magazine style`;

    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
        "Prefer": "wait"
      },
      body: JSON.stringify({
        // Stable Diffusion v1.5 img2img model version
        version: "15a3689ee13b0d2616e98820eca31d4c3abcd36672ff6afce5cb6ef165fe4204",
        input: {
          image: image, // Accepts standard Base64 Data URI
          prompt: prompt,
          prompt_strength: 0.8,
          num_inference_steps: 50,
          guidance_scale: 7.5
        }
      })
    });

    let prediction = await response.json();

    if (prediction.error) {
      return res.status(500).json({ message: prediction.error });
    }

    // Polling mechanism in case 'Prefer: wait' resolves to 'processing'
    let attempts = 0;
    while (
      (prediction.status === "starting" || prediction.status === "processing") && 
      attempts < 15
    ) {
      await new Promise(r => setTimeout(r, 2000)); // wait 2s
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`,
        }
      });
      prediction = await pollResponse.json();
      attempts++;
    }

    if (prediction.status === "succeeded" && prediction.output) {
      // output is usually an array of image URLs
      const imageUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
      return res.status(200).json({ imageUrl });
    } else {
      return res.status(500).json({ 
        message: "Image generation timed out or failed.", 
        status: prediction.status 
      });
    }

  } catch (error) {
    console.error("Replicate API Error:", error);
    return res.status(500).json({ message: "Internal server error", error: error.toString() });
  }
}
