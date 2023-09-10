import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import AddTopic from "./AddTopic";

function Topic() {
  const API_KEY1 = process.env.REACT_APP_API_KEY1;
  const { id } = useParams();
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(true);
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [linkData, setLinkData] = useState([]);
  const [topic, setTopic] = useState("");
  const [editedHeaderId, setEditedHeaderId] = useState(null);
  const [editedContentId, setEditedContentId] = useState(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedText, setEditedText] = useState("");
  const [editedTopic, setEditedTopic] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://${API_KEY1}.mockapi.io/data/${id}`
        );
        const data = await response.json();
        const dataArray = Array.isArray(data) ? data : [data];
        const topicData = dataArray.find((item) => item.id === id);
        if (topicData) {
          setLinkData(topicData.link);
          setTopic(topicData.topic);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [id]);

  const handleShowContentClick = () => {
    setShowContent(!showContent);
  };

  const handleAddTopicClick = () => {
    setShowAddTopic(!showAddTopic);
  };

  const handleDeleteTopic = async () => {
    try {
      // новий масив linkData без видаленого розділу
      const updatedLinkData = linkData.filter((item) => item.header !== topic);

      // Оновіть дані на сервері
      const response = await fetch(
        `https://${API_KEY1}.mockapi.io/data/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            link: updatedLinkData,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Помилка при видаленні розділу");
      }

      //  перехід на головну сторінку після видалення
      navigate("/");
    } catch (error) {
      console.error("Помилка при видаленні розділу:", error);
    }
  };

  const handleSaveTopic = async (header, title, text, id) => {
    try {
      const existingSection = linkData.find((item) => item.header === header);
      const newId = id + "-1";
      if (existingSection) {
        // Розділ уже існує, перевіряємо, чи існує заголовок вмісту
        const contentExists = existingSection.content.some(
          (content) => content.title === title
        );
        if (contentExists) {
          throw new Error(
            `Заголовок "${title}" уже існує в розділі "${header}"`
          );
        }
        const updatedLinkData = linkData.map((item) => {
          if (item.header === header) {
            return {
              ...item,
              content: [...item.content, { id: newId, title, text }],
            };
          }
          return item;
        });
        setLinkData(updatedLinkData);
      } else {
        // Створюємо новий розділ і додаємо вміст
        const newLinkData = [
          ...linkData,
          {
            id: header,
            header,
            content: [{ id: newId, title, text }],
          },
        ];
        setLinkData(newLinkData);
      }

      // Оновлюємо дані з сервера після успішного додавання
      const response = await fetch(`https://${API_KEY1}.mockapi.io/data/${id}`);
      const data = await response.json();
      const dataArray = Array.isArray(data) ? data : [data];
      const topicData = dataArray.find((item) => item.id === id);
      if (topicData) {
        setLinkData(topicData.link);
        setTopic(topicData.topic);
      }

      setShowAddTopic(false); //  закриваєте вікно додавання після успішного додавання
    } catch (error) {
      console.error("Помилка при збереженні розділу:", error);
    }
  };

  const handleEditClick = (contentId, title, text) => {
    setEditedContentId(contentId);
    setEditedTitle(title);
    setEditedText(text);
  };

  const handleSaveChanges = async () => {
    try {
      const updatedLinkData = linkData.map((item) => {
        const updatedContent = item.content.map((contentItem) => {
          if (contentItem.id === editedContentId) {
            return {
              ...contentItem,
              title: editedTitle,
              text: editedText,
            };
          }
          return contentItem;
        });
        return {
          ...item,
          content: updatedContent,
        };
      });

      const response = await fetch(
        `https://${API_KEY1}.mockapi.io/data/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            link: updatedLinkData,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Помилка при збереженні змін");
      }

      const updatedData = await response.json();
      setLinkData(updatedData.link);
      setEditedContentId(null);
      setEditedTitle("");
      setEditedText("");
    } catch (error) {
      console.error("Помилка при збереженні змін:", error);
    }
  };

  const handleEditTopicClick = () => {
    setEditedTopic(topic);
  };

  const handleSaveTopicChanges = async () => {
    try {
      const response = await fetch(
        `https://${API_KEY1}.mockapi.io/data/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topic: editedTopic,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Помилка при збереженні змін");
      }

      const updatedData = await response.json();
      setTopic(updatedData.topic);
      setEditedTopic("");
    } catch (error) {
      console.error("Помилка при збереженні змін:", error);
    }
  };

  const getContentByHeader = (header) => {
    const data = linkData.find((item) => item.header === header);
    return data ? data.content : [];
  };

  const handleEditHeaderClick = (header) => {
    setEditedHeaderId(header);
    setEditedTitle(header);
  };

  const handleDeleteHeader = async (header) => {
    try {
      // Видалення розділу за його заголовком
      const updatedLinkData = linkData.filter((item) => item.header !== header);

      const response = await fetch(
        `https://${API_KEY1}.mockapi.io/data/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            link: updatedLinkData,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Помилка при видаленні розділу");
      }

      const updatedData = await response.json();
      setLinkData(updatedData.link);
      setEditedHeaderId(null);
      setEditedTitle("");
    } catch (error) {
      console.error("Помилка при видаленні розділу:", error);
    }
  };

  const handleDeleteContent = async (contentId) => {
    try {
      // Видалення вмісту за його ID
      const updatedLinkData = linkData.map((item) => ({
        ...item,
        content: item.content.filter(
          (contentItem) => contentItem.id !== contentId
        ),
      }));

      const response = await fetch(
        `https://${API_KEY1}.mockapi.io/data/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            link: updatedLinkData,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Помилка при видаленні вмісту");
      }

      const updatedData = await response.json();
      setLinkData(updatedData.link);
      setEditedContentId(null);
    } catch (error) {
      console.error("Помилка при видаленні вмісту:", error);
    }
  };

  const handleSaveHeaderChanges = async () => {
    try {
      const updatedLinkData = linkData.map((item) => {
        if (item.header === editedHeaderId) {
          return {
            ...item,
            header: editedTitle,
          };
        }
        return item;
      });

      const response = await fetch(
        `https://${API_KEY1}.mockapi.io/data/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            link: updatedLinkData,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Помилка при збереженні змін");
      }

      const updatedData = await response.json();
      setLinkData(updatedData.link);
      setEditedHeaderId(null);
      setEditedTitle("");
    } catch (error) {
      console.error("Помилка при збереженні змін:", error);
    }
  };

  return (
    <div className="topic">
      <div className="search">
        <input type="text" placeholder="Пошук..." />
        {editedTopic ? (
          <>
            <input
              type="text"
              value={editedTopic}
              onChange={(e) => setEditedTopic(e.target.value)}
            />
            <button onClick={handleSaveTopicChanges}>Зберегти розділ</button>
            <button onClick={handleDeleteTopic}>Видалити розділ</button>
          </>
        ) : (
          <h1>{topic}</h1>
        )}
        <button onClick={handleShowContentClick}>
          {showContent ? "Сховати вміст" : "Показати вміст"}
        </button>
        <button onClick={handleAddTopicClick}>
          {showAddTopic ? "Закрити" : "Додати"}
        </button>
        {!editedTopic && (
          <button onClick={handleEditTopicClick}>Редагувати розділ</button>
        )}
        <Link to="/">Назад на мейн</Link>
      </div>
      {showAddTopic && (
        <AddTopic
          onAddTopic={handleSaveTopic}
          existingHeaders={linkData.map((item) => item.header)}
        />
      )}
      <div className="container">
        {linkData.map((item, index) => (
          <div key={`section-${index}`}>
            <h2>
              {editedHeaderId === item.header ? (
                <>
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                  />
                  <button onClick={handleSaveHeaderChanges}>Зберегти</button>
                  <button onClick={() => handleDeleteHeader(item.header)}>
                    Видалити
                  </button>
                </>
              ) : (
                <>
                  {item.header}
                  <button onClick={() => handleEditHeaderClick(item.header)}>
                    Редагувати
                  </button>
                  <button onClick={() => handleDeleteHeader(item.header)}>
                    Видалити
                  </button>
                </>
              )}
            </h2>
            {showContent && (
              <div className="card">
                <div className="card-block">
                  {getContentByHeader(item.header).map((contentItem) => (
                    <div key={contentItem.id}>
                      {editedContentId === contentItem.id ? (
                        <>
                          <input
                            type="text"
                            value={editedTitle}
                            onChange={(e) => setEditedTitle(e.target.value)}
                          />
                          <textarea
                            value={editedText}
                            onChange={(e) => setEditedText(e.target.value)}
                          />
                          <button onClick={handleSaveChanges}>Зберегти</button>
                          <button
                            onClick={() => handleDeleteContent(contentItem.id)}
                          >
                            Видалити
                          </button>
                        </>
                      ) : (
                        <>
                          <h3>{contentItem.title}</h3>
                          <p>{contentItem.text}</p>
                          <button
                            onClick={() =>
                              handleEditClick(
                                contentItem.id,
                                contentItem.title,
                                contentItem.text
                              )
                            }
                          >
                            Редагувати
                          </button>
                          <button
                            onClick={() => handleDeleteContent(contentItem.id)}
                          >
                            Видалити
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
export default Topic;
