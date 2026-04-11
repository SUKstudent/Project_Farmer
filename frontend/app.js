
async function send(textFromVoice) {
  const input = textFromVoice || document.getElementById('input').value;

  document.getElementById('chat').innerHTML += '<p>👨‍🌾 ' + input + '</p>';

  const res = await fetch('http://localhost:5000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: input })
  });

  const data = await res.json();

  document.getElementById('chat').innerHTML += '<p>🤖 ' + data.reply + '</p>';

  speechSynthesis.speak(new SpeechSynthesisUtterance(data.reply));
}

function startVoice() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'kn-IN';

  recognition.start();

  recognition.onresult = (e) => {
    send(e.results[0][0].transcript);
  };
}
