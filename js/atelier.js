document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const uploadInput = document.getElementById('silhouette-upload');
    const imagePreview = document.getElementById('image-preview');
    const uploadPrompt = document.getElementById('upload-prompt');
    const garmentCards = document.querySelectorAll('.garment-card');
    const generateBtn = document.getElementById('generate-btn');
    const generateBtnText = document.getElementById('generate-btn-text');
    const loadingState = document.getElementById('loading-state');
    const resultSection = document.getElementById('result-section');
    const resultImage = document.getElementById('generated-result-image');
    const whatsappBtn = document.getElementById('whatsapp-order-btn');
    
    // State
    let uploadedImageBase64 = null;
    let selectedGarment = null;

    // 1. Handle Image Upload
    uploadInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                uploadedImageBase64 = event.target.result;
                imagePreview.src = uploadedImageBase64;
                imagePreview.classList.remove('hidden');
                uploadPrompt.classList.add('hidden');
                
                checkReadyState();
            };
            reader.readAsDataURL(file);
        }
    });

    // 2. Handle Garment Selection
    garmentCards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove active from all
            garmentCards.forEach(c => c.classList.remove('active'));
            // Add active to clicked
            card.classList.add('active');
            
            selectedGarment = card.getAttribute('data-garment');
            checkReadyState();
        });
    });

    // 3. Check if both are selected to enable button
    function checkReadyState() {
        if (uploadedImageBase64 && selectedGarment) {
            generateBtn.removeAttribute('disabled');
        } else {
            generateBtn.setAttribute('disabled', 'true');
        }
    }

    // 4. Handle Generate Click (Mock API)
    generateBtn.addEventListener('click', async () => {
        if (!uploadedImageBase64 || !selectedGarment) return;

        // Change UI state to loading
        generateBtn.classList.add('hidden');
        loadingState.classList.remove('hidden');
        loadingState.classList.add('flex');
        resultSection.classList.add('hidden');
        resultSection.classList.remove('opacity-100');

        try {
            const response = await fetch('/api/fitting-room', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: uploadedImageBase64,
                    garment: selectedGarment
                })
            });
            
            let data;
            try {
                data = await response.json();
            } catch (jsonErr) {
                if (response.status === 404) {
                    throw new Error("API endpoint not found (404). Ensure you are running via 'vercel dev'.");
                }
                throw new Error(`API error (Status ${response.status})`);
            }
            
            if (!response.ok) {
                throw new Error(data.message || data.error || 'Replicate API error');
            }

            const mockResultSrc = data.imageUrl; // Use the returned URL from API
            
            // Add a slight artificial delay for dramatic effect
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            showResult(mockResultSrc, selectedGarment);
            
        } catch (error) {
            console.error('Generation Error:', error);
            alert(`Atelier Error: ${error.message}`);
        } finally {
            // Reset loading state
            generateBtn.classList.remove('hidden');
            loadingState.classList.remove('flex');
            loadingState.classList.add('hidden');
        }
    });

    // 5. Display Result
    function showResult(imageSrc, garmentName) {
        resultImage.src = imageSrc;
        
        // Update WhatsApp Link
        const message = encodeURIComponent(`Hello Calufia Atelier,\n\nI would like to order this look:\n\n${garmentName}\n\nI generated a preview on the Digital Atelier.`);
        whatsappBtn.href = `https://wa.me/26771435744?text=${message}`;

        // Show section smoothly
        resultSection.classList.remove('hidden');
        
        // Small delay to allow display block to apply before changing opacity for transition
        setTimeout(() => {
            resultSection.classList.add('opacity-100');
            resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Trigger reveals in the newly visible section
            const newReveals = resultSection.querySelectorAll('.reveal');
            newReveals.forEach((el, index) => {
                setTimeout(() => {
                    el.classList.add('active');
                }, index * 200); // Staggered reveal
            });
            
        }, 50);
    }
});
