"use client";
import Head from "next/head";
import React, { useEffect } from "react";
import { Terminal } from "xterm";
import { AttachAddon } from "xterm-addon-attach";
import { FitAddon } from "xterm-addon-fit";

const token = "yTg9907texyS5xk2qGcTmr5DxmfiHF";

export default function Home() {
  const fitAddon = new FitAddon();
  useEffect(() => {
    // Buat instance Terminal
    const term = new Terminal({
      cursorBlink: true,
      rendererType: "canvas",
      convertEol: true, // Mengkonversi newline menjadi <br> dan menjaga teks rapih
      //   disableStdin: true, // Menonaktifkan masukan stdin (opsional)
    });

    // Tentukan elemen HTML yang akan menjadi wadah terminal
    const terminalContainer = document.getElementById("terminal");

    // Pasang Terminal ke dalam elemen tersebut

    // Buat koneksi WebSocket
    const socket = new WebSocket(
      `ws://10.10.67.234:8023/user/jupyter/terminals/websocket/1?token=${token}`
    );

    // Tambahkan AttachAddon ke Terminal
    // const attachAddon = new AttachAddon(socket);
    term.open(terminalContainer);
    term.loadAddon(fitAddon);
    fitAddon.fit();

    // Kelola koneksi WebSocket
    socket.addEventListener("open", (event) => {
      // Koneksi terbuka, Anda dapat menambahkan log atau tindakan lain di sini
      //   socket.send(JSON.stringify(["stdin", "\r"]));
    });

    let websocketMessage = ""; // Inisialisasi pesan WebSocket
    socket.addEventListener("message", (event) => {
      // Mengambil pesan dari server WebSocket
      const message = JSON.parse(event.data);

      // Memeriksa apakah ada pesan di dalam array dan apakah indeks kedua ada
      if (Array.isArray(message) && message.length > 1) {
        const secondElement = message[1]; // Mengambil elemen kedua (index 1)
        websocketMessage = secondElement;
      }

      // Menambahkan pesan ke terminal Xterm.js
      term.write(websocketMessage);
    });

    term.onData((data) => {
      socket.send(JSON.stringify(["stdin", data]));
    });

    socket.addEventListener("close", (event) => {
      // Koneksi ditutup, Anda dapat menambahkan log atau tindakan lain di sini
      term.write("\r\n\x1b[31mConnection Closed\x1b[m\r\n");
    });

    // Membersihkan sumber daya saat komponen di-unmount
    return () => {
      term.dispose();
      socket.close();
    };
  }, []);

  return (
    <div id="terminal" style={{ width: "100%", height: "100vh" }}>
      <React.Fragment>
        <Head>
          <title>Next.js with Xterm.js</title>
        </Head>
        <div id="terminal"></div>
      </React.Fragment>
    </div>
  );
}
