document.getElementById('ask').addEventListener('click', async () => {
    const fileName = document.getElementById('fileName').value;
    const question = document.getElementById('question').value;

    try {
        const response = await fetch('/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fileName, question })
        });

        const result = await response.json();
        document.getElementById('response').innerText = result.answer || 'No se obtuvo respuesta.';
    } catch (error) {
        console.error('Error al hacer la pregunta:', error);
        document.getElementById('response').innerText = 'Error al procesar la pregunta.';
    }
});
