import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

function Home() {
  const API_KEY1 = process.env.REACT_APP_API_KEY1;
  const [inputText, setInputText] = useState("");
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    fetch(`https://${API_KEY1}.mockapi.io/data`)
      .then((response) => response.json())
      .then((json) => {
        setData(json);
      })
      .catch((error) => {
        console.error("Помилка запиту:", error);
      });
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleAddButtonClick = () => {
    if (inputText.trim() !== "") {
      const newData = {
        topic: inputText,
        link: [],
      };
      sendDataToServer(newData, "POST")
        .then(() => {
          fetchData();
          setInputText("");
        })
        .catch((error) => {
          console.error("Помилка надсилання даних на сервер:", error);
        });
    }
  };

  const handleLinkClick = (topic) => {
    navigate(`/topic/${topic}`);
  };

  const sendDataToServer = (data, method) => {
    let url = `https://${API_KEY1}.mockapi.io/data`;
    if (method === "DELETE") {
      url += `/${data.id}`;
    }
    return fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (response.ok) {
          console.log("Дані успішно надіслані на сервер");
        } else {
          console.error("Помилка надсилання даних на сервер");
        }
      })
      .catch((error) => {
        console.error("Помилка запиту:", error);
      });
  };

  return (
    <div className="wrapper">
      <input type="text" value={inputText} onChange={handleInputChange} />
      <button onClick={handleAddButtonClick}>Додати</button>
      <div>
        {data.map((item) => (
          <div key={item.id}>
            <Link
              to={`/topic/${item.id}`}
              onClick={() => handleLinkClick(item.topic)}
            >
              {item.topic}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
