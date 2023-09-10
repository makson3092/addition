import React, { useState } from "react";
import { useParams } from "react-router-dom";

const AddTopic = ({ onAddTopic, existingHeaders }) => {
  const API_KEY1 = process.env.REACT_APP_API_KEY1;
  const { id } = useParams();
  const [selectedHeader, setSelectedHeader] = useState("");
  const [newHeader, setNewHeader] = useState("");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  const handleAddTopic = async () => {
    if ((selectedHeader || newHeader) && title && text) {
      const header = selectedHeader || newHeader;

      const currentPageId = id; //  відповідне значення id поточної сторінки

      try {
        const response = await fetch(
          `https://${API_KEY1}.mockapi.io/data/${currentPageId}`
        );
        const existingTopic = await response.json();

        // Перевірка, чи отримано належну відповідь від сервера
        if (!response.ok) {
          console.error("Помилка при отриманні даних з сервера");
          return;
        }

        //  індекс вмісту, що відповідає поточному заголовку
        const contentIndex = existingTopic.link.findIndex(
          (link) => link.header === header
        );

        if (contentIndex !== -1) {
          // Якщо знайдено вміст з поточним заголовком, додайте новий вміст до списку вмісту
          const existingContent = existingTopic.link[contentIndex].content;
          const newId = `${contentIndex + 1}-${existingContent.length + 1}`;
          const newContent = {
            id: newId,
            title: title,
            text: text,
          };

          existingContent.push(newContent);
        } else {
          // Якщо не знайдено вміст з поточним заголовком, створює новий вміст з цим заголовком
          const newLink = {
            header: header,
            content: [
              {
                id: `${existingTopic.link.length + 1}-1`,
                title: title,
                text: text,
              },
            ],
          };
          existingTopic.link.push(newLink);
        }

        const saveResponse = await fetch(
          `https://${API_KEY1}.mockapi.io/data/${currentPageId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(existingTopic),
          }
        );

        if (saveResponse.ok) {
          // Дані успішно збережені на сервері
          onAddTopic(header, title, text, id);
          setSelectedHeader("");
          setNewHeader("");
          setTitle("");
          setText("");
        } else {
          // Виникла помилка при збереженні даних
          console.error("Помилка при збереженні даних на сервері");
        }
      } catch (error) {
        console.error("Помилка при взаємодії з сервером", error);
      }
    }
  };

  return (
    <div className="add-topic">
      <h2>Додати розділ</h2>
      <select
        value={selectedHeader}
        onChange={(e) => setSelectedHeader(e.target.value)}
        disabled={existingHeaders.length < 1}
      >
        <option value="">Оберіть розділ</option>
        {existingHeaders.map((header) => (
          <option key={header} value={header}>
            {header}
          </option>
        ))}
      </select>
      <input
        type="text"
        placeholder="Створити новий розділ"
        value={newHeader}
        onChange={(e) => setNewHeader(e.target.value)}
        disabled={selectedHeader !== ""}
      />
      <input
        type="text"
        placeholder="Заголовок вмісту"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Текст вмісту"
        value={text}
        onChange={(e) => setText(e.target.value)}
      ></textarea>
      <button onClick={handleAddTopic}>Додати</button>
    </div>
  );
};

export default AddTopic;
