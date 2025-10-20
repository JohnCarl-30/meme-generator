import { useState, useEffect, useRef } from "react";
export default function Main() {
  const [meme, setMeme] = useState({
    topText: "One does not simply",
    bottomText: "Walk into Mordor",
    imageUrl: "../src/assets/Trollface.png",
  });
  const fileInputRef = useRef(null);
  const [allMemes, setAllMemes] = useState([]);

  useEffect(() => {
    fetch("https://api.imgflip.com/get_memes")
      .then((res) => res.json())
      .then((data) => setAllMemes(data.data.memes));
  }, []);

  useEffect(() => {
    return () => {
      if (meme.imageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(meme.imageUrl);
      }
    };
  }, [meme.imageUrl]);

  function handleChange(e) {
    const { name, value } = e.target;

    setMeme((prev) => ({ ...prev, [name]: value }));
  }

  function getMemeImage() {
    const randomNumber = Math.floor(Math.random() * allMemes.length);
    const newMeme = allMemes[randomNumber].url;
    setMeme((prevMeme) => ({
      ...prevMeme,
      imageUrl: newMeme,
    }));
  }
  function handleDownload() {
    const image = new Image();
    image.crossOrigin = "anonymous"; // This is crucial for fetching images from other domains

    image.src = meme.imageUrl;

    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = image.width;
      canvas.height = image.height;

      ctx.drawImage(image, 0, 0);

      ctx.font = "bold 70px Impact";
      ctx.fillStyle = "white";
      ctx.strokeStyle = "black";
      ctx.lineWidth = 3;
      ctx.textAlign = "center";

      ctx.fillText(meme.topText.toUpperCase(), canvas.width / 2, 60);
      ctx.strokeText(meme.topText.toUpperCase(), canvas.width / 2, 60);

      ctx.fillText(
        meme.bottomText.toUpperCase(),
        canvas.width / 2,
        canvas.height - 30
      );
      ctx.strokeText(
        meme.bottomText.toUpperCase(),
        canvas.width / 2,
        canvas.height - 30
      );

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "meme.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    image.onerror = () => {
      console.error("Failed to load image for canvas");
      alert("Could not download the image. The source may be blocking it.");
    };
  }
  function insertImage(e, setMeme) {
    const file = e.target.files[0];

    if (file) {
      const newImageUrl = URL.createObjectURL(file);

      setMeme((prevMeme) => ({
        ...prevMeme,
        imageUrl: newImageUrl,
      }));
    }
  }

  return (
    <main>
      <div className="form">
        <label>
          Top text
          <input
            type="text"
            name="topText"
            placeholder="top"
            onChange={handleChange}
            value={meme.topText}
          />
        </label>

        <label>
          Bottom text
          <input
            type="text"
            name={"bottomText"}
            placeholder="Bottom"
            onChange={handleChange}
            value={meme.bottomText}
          />
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept="image/*"
            onChange={(e) => insertImage(e, setMeme)}
          />
        </label>
        <button onClick={getMemeImage}>Get a new meme image</button>
        <button onClick={() => fileInputRef.current.click()}>
          Insert your own image
        </button>
      </div>
      <div className="meme">
        <img src={meme.imageUrl} />
        <span className="top"> {meme.topText}</span>
        <span className="bot"> {meme.bottomText}</span>
      </div>
      <button onClick={handleDownload}>DownLoad Image</button>
    </main>
  );
}
