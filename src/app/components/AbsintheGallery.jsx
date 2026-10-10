"use client";

import { useEffect, useRef, useState } from "react";

export default function AbsintheGallery({
  primaryGreen = "#4d8426",
  darkBg = "#121413",
  titleFont = "Fredericka the Great",
  bodyFont = "Jost",
  serifFont = "Fleur De Leah",
  overlayImageUrl = "https://cybersandbox.ca/wp-content/uploads/2022/05/green-paper-bg.jpg",
  galleryItems = [
    {
      id: 0,
      name: "Ernest Hemingway",
      signature:
        "https://cybersandbox.ca/wp-content/uploads/2022/05/Hemingway_Signature.png",
      frontImage:
        "https://cybersandbox.ca/wp-content/uploads/2022/05/ErnestHemingway-1030x1030.jpg",
      frontAlt: "Ernest Hemingway",
      frontTitle: "Ernest Hemingway",
      frontDate: "July 21, 1899 – July 2, 1961",
      frontDesc:
        "American novelist, short-story writer, and journalist. His economical and understated style (which he termed the 'iceberg theory') had a strong influence on 20th-century fiction.",
      backImage:
        "https://cybersandbox.ca/wp-content/uploads/2022/05/hemmingway.jpeg",
      backAlt: "Ernest Hemingway",
      backQuote:
        "Got tight last night on <b>absinthe</b> and did knife tricks. Great success shooting the knife into the piano. The woodworms are so bad and eat hell out of all furniture that you can always claim the woodworms did it.",
      backAttribution: "Ernest Hemingway, 1931 letter",
      thumbImage:
        "https://cybersandbox.ca/wp-content/uploads/2022/05/thumb-hemingway.png",
    },
    {
      id: 1,
      name: "Oscar Wilde",
      signature:
        "https://cybersandbox.ca/wp-content/uploads/2022/05/Oscar_Wilde_Signature.png",
      frontImage:
        "https://cybersandbox.ca/wp-content/uploads/2022/05/Wilde-1030x704.jpg",
      frontAlt: "Oscar Wilde",
      frontTitle: "Oscar Wilde",
      frontDate: "16 October 1854 – 30 November 1900",
      frontDesc:
        'Irish poet and playwright, one of the most popular playwrights in London in the early 1890s. Author of "The Picture of Dorian Gray".',
      backImage:
        "https://cybersandbox.ca/wp-content/uploads/2022/05/Oscar_Wilde-700x1030.jpg",
      backAlt: "Oscar Wilde",
      backQuote:
        "After the first glass of <b>absinthe</b> you see things as you wish they were. After the second you see them as they are not. Finally you see things as they really are, and that is the most horrible thing in the world...",
      backAttribution: "Oscar Fingal O'Flahertie Wills Wilde",
      thumbImage:
        "https://cybersandbox.ca/wp-content/uploads/2022/05/thumb-wilde.png",
    },
    {
      id: 2,
      name: "Vincent van Gogh",
      signature:
        "https://cybersandbox.ca/wp-content/uploads/2022/05/Van-Gogh_Signature.png",
      frontImage:
        "https://cybersandbox.ca/wp-content/uploads/2022/05/Vincent_van_Gogh-815x1030.jpg",
      frontAlt: "Vincent van Gogh",
      frontTitle: "Vincent van Gogh",
      frontDate: "30 March 1853 – 29 July 1890",
      frontDesc:
        "Dutch Post-Impressionist painter who posthumously became one of the most famous and influential figures in Western art history.",
      backImage:
        "https://cybersandbox.ca/wp-content/uploads/2022/05/Still-Life-with-Absinthe-720x1030.jpg",
      backAlt: "Vincent van Gogh",
      backQuote: "<strong>Still Life with Absinthe</strong>",
      backAttribution: "Vincent van Gogh, 1887",
      thumbImage:
        "https://cybersandbox.ca/wp-content/uploads/2022/05/thumb-van-gogh.png",
    },
    {
      id: 3,
      name: "Pablo Picasso",
      signature:
        "https://cybersandbox.ca/wp-content/uploads/2022/05/Picasso_Signature.png",
      frontImage:
        "https://cybersandbox.ca/wp-content/uploads/2022/05/PabloPicasso1908-742x1030.jpg",
      frontAlt: "Pablo Picasso",
      frontTitle: "Pablo Picasso",
      frontDate: "2 February 1882 – 13 January 1941",
      frontDesc:
        "Spanish painter, sculptor, printmaker, ceramicist and theatre designer. Regarded as one of the most influential artists of the 20th century.",
      backImage:
        "https://cybersandbox.ca/wp-content/uploads/2022/05/absinthe-drinker.jpg",
      backAlt: "Pablo Picasso",
      backQuote: "<strong>The Absinthe Drinker</strong>",
      backAttribution: "Pablo Picasso, 1901",
      thumbImage:
        "https://cybersandbox.ca/wp-content/uploads/2022/05/thumb-picasso.png",
    },
    {
      id: 4,
      name: "Aliester Crowley",
      signature:
        "https://cybersandbox.ca/wp-content/uploads/2022/05/Signature_of_Aleister_Crowley.png",
      frontImage:
        "https://cybersandbox.ca/wp-content/uploads/2022/05/Aliester_Crowley-738x1030.jpg",
      frontAlt: "Aliester Crowley",
      frontTitle: "Aliester Crowley",
      frontDate: "12 October 1875 – 1 December 1947",
      frontDesc:
        "English occultist, ceremonial magician, poet, painter, novelist, mountaineer, and founder of the religion of Thelema.",
      backImage:
        "https://cybersandbox.ca/wp-content/uploads/2022/05/Aleister_Crowley_-_1929.jpg",
      backAlt: "Aliester Crowley",
      backQuote:
        "It is as if the first diviner of <b>absinthe</b> had been indeed a magician intent upon a combination of sacred drugs which should cleanse, fortify and perfume the human soul.",
      backAttribution: "Aliester Crowley, 'Absinthe The Green Goddess'",
      thumbImage:
        "https://cybersandbox.ca/wp-content/uploads/2022/05/thumb-crowley.png",
    },
    {
      id: 5,
      name: "Marie Corelli",
      signature:
        "https://cybersandbox.ca/wp-content/uploads/2022/05/Signature_of_Marie_Corelli.png",
      frontImage:
        "https://cybersandbox.ca/wp-content/uploads/2022/05/Portrait_of_Marie_Corelli.jpg",
      frontAlt: "Marie Corelli",
      frontTitle: "Marie Corelli",
      frontDate: "1 May 1855 – 21 April 1924",
      frontDesc:
        "English novelist on topics of reincarnation, astral projection and mysticism. After her first novel, 'A Romance of Two Worlds' in 1886, she became a bestselling fiction writer in England.",
      backImage:
        "https://cybersandbox.ca/wp-content/uploads/2022/05/corelli.jpg",
      backAlt: "Marie Corelli",
      backQuote:
        "Let me be mad, then, by all means! Mad with the madness of <b>Absinthe</b>, the wildest, most luxurious madness in the world! Vive la folie! Vive l'amour! Vive l'animalisme! Vive le Diable!",
      backAttribution: "Marie Corelli",
      thumbImage:
        "https://cybersandbox.ca/wp-content/uploads/2022/05/thumb-corelli.png",
    },
    {
      id: 6,
      name: "James Joyce",
      signature:
        "https://cybersandbox.ca/wp-content/uploads/2022/05/Joyce_Signature.png",
      frontImage:
        "https://cybersandbox.ca/wp-content/uploads/2022/05/JamesJoyce-795x1030.jpg",
      frontAlt: "James Joyce",
      frontTitle: "James Joyce",
      frontDate: "2 February 1882 – 13 January 1941",
      frontDesc:
        "Irish novelist, short story writer, poet, and literary critic. He contributed to the modernist avant-garde movement and is regarded as one of the most influential and important writers of the 20th century.",
      backImage: "https://cybersandbox.ca/wp-content/uploads/2022/05/joyce.jpg",
      backAlt: "James Joyce",
      backQuote: "<strong>Green eyes, I see you. Fang, I feel.</strong>",
      backAttribution: "James Joyce, 'Ulysses', 1920",
      thumbImage:
        "https://cybersandbox.ca/wp-content/uploads/2022/05/thumb-joyce.png",
    },
    {
      id: 7,
      name: "Hunter S. Thompson",
      signature:
        "https://cybersandbox.ca/wp-content/uploads/2022/05/Hunter_S_Thompson_signature.png",
      frontImage:
        "https://cybersandbox.ca/wp-content/uploads/2022/05/Hunter_S_Thompson_Las_Vegas_1971.jpg",
      frontAlt: "Hunter S. Thompson",
      frontTitle: "Hunter S. Thompson",
      frontDate: "July 18, 1937 – February 20, 2005",
      frontDesc:
        "American journalist and author who founded the gonzo journalism movement. He remains best known for his book, 'Fear and Loathing in Las Vegas' (1971).",
      backImage:
        "https://cybersandbox.ca/wp-content/uploads/2022/05/Thompson_BIG.jpg",
      backAlt: "Hunter S. Thompson",
      backQuote:
        'Let us toast to animal pleasures, to escapism, to rain on the roof and instant coffee, to unemployment insurance and library cards, to music and warm bodies and contraceptives... and to the "good life", whatever it is and wherever it happens to be.',
      backAttribution: "Hunter S. Thompson",
      thumbImage:
        "https://cybersandbox.ca/wp-content/uploads/2022/05/thumb-thompson.png",
    },
    {
      id: 8,
      name: "Arthur Rimbaud",
      signature:
        "https://cybersandbox.ca/wp-content/uploads/2022/05/Arthur_Rimbaud_signature.png",
      frontImage:
        "https://cybersandbox.ca/wp-content/uploads/2022/05/Rimbaud.png",
      frontAlt: "Arthur Rimbaud",
      frontTitle: "Arthur Rimbaud",
      frontDate: "20 October 1854 – 10 November 1891",
      frontDesc:
        "French poet known for his transgressive and surreal themes and for his influence on modern literature and arts, prefiguring surrealism. Rimbaud completely stopped writing literature at age 20 after assembling his last major work, 'Illuminations'.",
      backImage:
        "https://cybersandbox.ca/wp-content/uploads/2022/05/rimbaud.jpg",
      backAlt: "Arthur Rimbaud",
      backQuote:
        "When the poet's pain is soothed by a liquid jewel held in the sacred chalice, upon which rests the pierced spoon, the crystal sweetness, icy streams trickle down. The darkest forest melts into an open meadow. Waves of green seduce. Sanity surrendered, the soul spirals toward the murky depths, wherin lies the beautiful madness - <b>absinthe</b>.",
      backAttribution: "Arthur Rimbaud",
      thumbImage:
        "https://cybersandbox.ca/wp-content/uploads/2022/05/thumb-rimbaud.png",
    },
  ],
}) {
  const [pageNum, setPageNum] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [flippedCards, setFlippedCards] = useState({});
  const sliderRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.keyCode) {
        case 37: // LEFT
        case 40: // DOWN
          prevPage();
          break;
        case 39: // RIGHT
        case 38: // UP
          nextPage();
          break;
        case 32: // SPACE
          toggleAll();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pageNum]);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const diffX = touchStartX - touchEndX;
      const diffY = touchStartY - touchEndY;

      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 50) nextPage();
        else if (diffX < -50) prevPage();
      } else {
        if (diffY > 50) setMenuOpen(true);
        else if (diffY < -50) setMenuOpen(false);
      }
    };

    slider.addEventListener("touchstart", handleTouchStart);
    slider.addEventListener("touchend", handleTouchEnd);

    return () => {
      slider.removeEventListener("touchstart", handleTouchStart);
      slider.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  const nextPage = () => {
    if (pageNum < galleryItems.length - 1) setPageNum(pageNum + 1);
  };

  const prevPage = () => {
    if (pageNum > 0) setPageNum(pageNum - 1);
  };

  const setPage = (x) => {
    setPageNum(x);
    setMenuOpen(false);
  };

  const pageUp = nextPage;
  const pageDown = prevPage;

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const toggleCard = (index) => {
    setFlippedCards((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const toggleAll = () => {
    setFlippedCards((prev) => {
      const newState = {};
      for (let i = 0; i < galleryItems.length; i++) {
        newState[i] = !prev[i];
      }
      return newState;
    });
  };

  return (
    <>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Fleur+De+Leah&family=Fredericka+the+Great&family=Jost:ital,wght@0,100;0,200;0,400;0,500;0,700;0,900;1,100;1,200;1,400;1,500;1,700;1,900&display=swap");

        :root {
          --green: ${primaryGreen};
          --title-font: "${titleFont}", serif;
          --body-font: "${bodyFont}", sans-serif;
          --serif-font: "${serifFont}", serif;
        }

        * {
          box-sizing: border-box;
        }

        *::selection {
          background: var(--green);
          text-shadow: 0.14em 0.14em black;
          color: white;
        }

        html {
          background: ${darkBg};
          color: white;
          overflow-x: hidden;
        }

        body {
          padding: 0;
          margin: 0;
          overflow-x: hidden;
        }

        h1 {
          font-family: var(--title-font);
          font-size: 6vmin;
          margin: 0;
          text-align: center;
          position: fixed;
          top: 4vmin;
          left: 4vmin;
          width: calc(100% - 120px);
          text-align: left;
          color: #d5d8ce;
          text-shadow: 0 2px 4px rgba(0,0,0,0.8), 0 4px 12px rgba(0,0,0,0.5);
          z-index: 30;
        }

        h1 b {
          font-family: var(--serif-font);
          font-size: 1.6em;
          display: inline-block;
          line-height: 0.9em;
          font-weight: normal;
          color: var(--green);
          position: relative;
          margin-left: 10px;
        }

        @media only screen and (max-width: 768px) {
          h1 {
            font-size: 24px;
            top: 20px;
            left: 20px;
            width: calc(100% - 90px);
          }
          h1 b {
            display: block;
            margin-left: 0;
            font-size: 1.3em;
          }
        }
      `}</style>

      {/* Menu Trigger Button Asset (Right Top Corner) */}
      <button
        onClick={toggleMenu}
        style={{
          position: "fixed",
          right: "25px",
          top: "25px",
          zIndex: 101,
          appearance: "none",
          width: "55px",
          height: "55px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          fontSize: 0,
          backgroundImage: menuOpen
            ? "url('https://cybersandbox.ca/wp-content/uploads/2022/05/absinthe-sketch.png')"
            : "url('https://cybersandbox.ca/wp-content/uploads/2022/05/absinthe-sketch-empty.png')",
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 1,
          transition: "all 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.filter = "saturate(1) brightness(1) blur(0)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.filter = "saturate(1) brightness(0.8) blur(0)";
        }}
      />

      <div
        ref={sliderRef}
        style={{
          width: `${galleryItems.length * 100}vw`,
          transition: "margin 0.5s ease-in-out",
          marginLeft: `-${pageNum * 100}vw`,
        }}
      >
        {/* Overlay */}
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 2,
            width: "100%",
            height: "100%",
            backgroundImage: `url(${overlayImageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            mixBlendMode: "overlay",
            filter: "saturate(0.25) brightness(1.25)",
            pointerEvents: "none",
          }}
        />
        
        {galleryItems.map((item) => (
          <div
            key={item.id}
            style={{
              position: "relative",
              float: "left",
              width: "100vw",
              maxWidth: "100vw",
              height: "100vh",
              display: "grid",
              alignContent: "center",
            }}
          >
            <article
              style={{
                width: "82vmin",
                height: "82vmin",
                margin: "0 auto",
                marginTop: "-4vmin",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 3vmin 5vmin rgba(0, 0, 0, 0.6)",
                borderRadius: "4px",
                cursor: "pointer",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
              onClick={() => toggleCard(item.id)}
            >
              {/* Signature */}
              <img
                src={item.signature}
                alt="signature"
                style={{
                  position: "absolute",
                  top: "3vmin",
                  right: "3vmin",
                  width: "30%",
                  minWidth: "130px",
                  maxHeight: "8vmin",
                  objectFit: "contain",
                  objectPosition: "top right",
                  filter: "invert(1)",
                  mixBlendMode: "screen",
                  zIndex: 99,
                }}
              />

              {/* Front Section */}
              <section
                style={{
                  transition: "all 0.4s ease",
                  height: "100%",
                  width: "100%",
                  position: "relative",
                  zIndex: flippedCards[item.id] ? 0 : 2,
                  opacity: flippedCards[item.id] ? 0 : 1,
                }}
              >
                <img
                  src={item.frontImage}
                  alt={item.frontAlt}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: 1,
                    backgroundImage: `url(${overlayImageUrl})`,
                    backgroundColor: primaryGreen,
                    backgroundSize: "100% 100%",
                    mixBlendMode: "multiply",
                    filter: "brightness(1.4) saturate(0.85)",
                    opacity: 0.85,
                    transition: "all 0.5s ease",
                    pointerEvents: "none",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    padding: "5vmin",
                    fontSize: "3vmin",
                    zIndex: 2,
                    lineHeight: "1.35em",
                    fontFamily: "var(--body-font)",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      width: "100%",
                      height: "140%",
                      background:
                        "linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.75) 85%)",
                      zIndex: -1,
                    }}
                  />

                  <h3
                    style={{
                      margin: 0,
                      marginBottom: "0.3em",
                      fontSize: "2.4em",
                      fontWeight: "normal",
                      fontFamily: "var(--title-font)",
                      lineHeight: "1em",
                      color: "#fff",
                      textShadow: "0 0.08em 0.15em rgba(0, 0, 0, 0.8)",
                    }}
                  >
                    {item.frontTitle}
                  </h3>

                  <p style={{ margin: 0 }}>
                    <strong
                      style={{
                        fontSize: "1.15em",
                        lineHeight: "1.4em",
                        color: "var(--green)",
                        textShadow: "0 0.08em 0.15em rgba(0, 0, 0, 0.8)",
                      }}
                    >
                      {item.frontDate}
                    </strong>
                    <em
                      style={{
                        display: "block",
                        marginTop: "0.4em",
                        color: "#e2e2e2",
                        textShadow: "0 0.08em 0.15em rgba(0, 0, 0, 0.8)",
                      }}
                    >
                      {item.frontDesc}
                    </em>
                  </p>
                </div>
              </section>

              {/* Back Section */}
              <section
                style={{
                  transition: "all 0.4s ease",
                  height: "100%",
                  width: "100%",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  zIndex: flippedCards[item.id] ? 2 : 0,
                  opacity: flippedCards[item.id] ? 1 : 0,
                }}
              >
                <img
                  src={item.backImage}
                  alt={item.backAlt}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transform: flippedCards[item.id]
                      ? "scale(1.05)"
                      : "scale(1)",
                    transition: "transform 0.4s ease",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: 1,
                    backgroundImage: `url(${overlayImageUrl})`,
                    backgroundColor: primaryGreen,
                    backgroundSize: "100% 100%",
                    mixBlendMode: "multiply",
                    filter: "brightness(1.3) saturate(0.8)",
                    opacity: 0.88,
                    transition: "all 0.5s ease",
                    pointerEvents: "none",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    padding: "5vmin",
                    fontSize: "3vmin",
                    zIndex: 2,
                    lineHeight: "1.8em",
                    fontFamily: "var(--body-font)",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      width: "100%",
                      height: "140%",
                      background:
                        "linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.8) 85%)",
                      zIndex: -1,
                    }}
                  />

                  <p style={{ margin: 0, color: "#fff" }}>
                    <q
                      style={{
                        textShadow: "0 0.08em 0.15em rgba(0, 0, 0, 0.9)",
                      }}
                    >
                      <span
                        dangerouslySetInnerHTML={{ __html: item.backQuote }}
                      />
                    </q>
                    <em
                      style={{
                        display: "block",
                        marginTop: "0.5em",
                        color: "var(--green)",
                        fontWeight: "500",
                        textShadow: "0 0.08em 0.15em rgba(0, 0, 0, 0.9)",
                      }}
                    >
                      {item.backAttribution}
                    </em>
                  </p>
                </div>
              </section>
            </article>
          </div>
        ))}

        {/* Navigation Dock (Cleanly Separated at the Bottom Boundary) */}
        <nav
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            width: "100%",
            height: menuOpen ? "140px" : "70px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "10px",
            gap: "10px",
            zIndex: 99,
            transition: "all 0.4s ease-in-out",
          }}
        >
          {/* Thumbnails Collection Row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: menuOpen ? "70px" : "0px",
              opacity: menuOpen ? 1 : 0,
              overflow: "hidden",
              pointerEvents: menuOpen ? "auto" : "none",
              transition: "all 0.4s ease-in-out",
              marginBottom: menuOpen ? "5px" : "0px",
            }}
          >
            {galleryItems.map((item) => (
              <img
                key={item.id}
                src={item.thumbImage}
                title={item.name}
                onClick={() => setPage(item.id)}
                style={{
                  width: "55px",
                  height: "55px",
                  border:
                    pageNum === item.id ? "2px solid #fff" : "2px solid #333",
                  backgroundColor: "#222",
                  cursor: "pointer",
                  margin: "0 5px",
                  objectFit: "cover",
                  transform: menuOpen ? "translateY(0)" : "translateY(20px)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#999";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor =
                    pageNum === item.id ? "#fff" : "#333";
                }}
              />
            ))}
          </div>

          {/* Nav Arrow Row Setup */}
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              padding: "0 30px",
            }}
          >
            {/* Previous Button */}
            <button
              onClick={pageDown}
              style={{
                appearance: "none",
                width: "45px",
                height: "45px",
                background: "transparent",
                border: "none",
                cursor: pageNum === 0 ? "not-allowed" : "pointer",
                fontSize: 0,
                filter:
                  pageNum === 0
                    ? "saturate(0.5) brightness(0.2) blur(1px)"
                    : "saturate(1) brightness(0.8)",
                opacity: pageNum === 0 ? 0.4 : 0.9,
                transition: "all 0.3s ease",
                backgroundImage:
                  "url('https://cybersandbox.ca/wp-content/uploads/2022/05/pointy-finger-inv.png')",
                backgroundSize: "contain",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                transform: "scaleX(-1)",
              }}
              onMouseEnter={(e) => {
                if (pageNum > 0)
                  e.currentTarget.style.filter = "saturate(1) brightness(1)";
              }}
              onMouseLeave={(e) => {
                if (pageNum > 0)
                  e.currentTarget.style.filter = "saturate(1) brightness(0.8)";
              }}
            />

            {/* Next Button */}
            <button
              onClick={pageUp}
              style={{
                appearance: "none",
                width: "45px",
                height: "45px",
                background: "transparent",
                border: "none",
                cursor:
                  pageNum === galleryItems.length - 1
                    ? "not-allowed"
                    : "pointer",
                fontSize: 0,
                filter:
                  pageNum === galleryItems.length - 1
                    ? "saturate(0.5) brightness(0.2) blur(1px)"
                    : "saturate(1) brightness(0.8)",
                opacity: pageNum === galleryItems.length - 1 ? 0.4 : 0.9,
                transition: "all 0.3s ease",
                backgroundImage:
                  "url('https://cybersandbox.ca/wp-content/uploads/2022/05/pointy-finger-inv.png')",
                backgroundSize: "contain",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
              onMouseEnter={(e) => {
                if (pageNum < galleryItems.length - 1)
                  e.currentTarget.style.filter = "saturate(1) brightness(1)";
              }}
              onMouseLeave={(e) => {
                if (pageNum < galleryItems.length - 1)
                  e.currentTarget.style.filter = "saturate(1) brightness(0.8)";
              }}
            />
          </div>
        </nav>
      </div>
    </>
  );
}
