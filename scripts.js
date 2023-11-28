"use strict";

const url = "http://127.0.0.1:8080/api/v2.0/clients/";

function createClient (username, ip, status, latestHandshakeTimestamp) {
    const mainDiv = document.querySelector(`main`);
    const div = document.createElement('div');
    const hr = document.createElement('hr');
    div.className = "personal";
    mainDiv.append(hr);
    mainDiv.append(div);

    const activeClient = latestHandshakeTimestamp < 60;
    const active = activeClient ? "success" : "danger" ;

    div.innerHTML =
        `<header>
            <div>
                ${username}
            </div>
            <div class="d-flex">
                <div>${ip}</div>
                <div class="ms-1 bg-${active} border border-light rounded-circle" style="width: 10px; height: 10px;"></div>
            </div>                
        </header>
        <div class="btn-client">
            <div class="form-check form-switch">
                <input class="form-check-input status" type="checkbox" role="switch" username="${username} "${status ? "checked": ""}/>
            </div>
            <div class="btn-group" role="group">
                <button class="btn btn-outline-info showQRCode" username="${username}"><img src="./img/qr-code.svg\" alt="qr-code"></button>
                <button class="btn btn-outline-primary downloadQRCode" username="${username}"><img src="./img/download.svg\" alt="download"></button>
                <button class="btn btn-outline-danger basketClient" username="${username}"><img src="./img/basket.svg\" alt="basket"></button>
            </div>
        </div>`
}

// fetch clients data
(async function () {
    const response = await fetch(url, {method: "GET"});
    const commits = await response.json();
    commits.forEach((commit) => {
        createClient(commit["username"], commit["ip"], commit["status"], commit["latest_handshake_timestamp"]);
    })
}()
    .then (() => {
        const getQrCode = async (username) => {
            const response = await fetch(url + username, {method: "GET"});
            return await response.text();
        }

        document.querySelectorAll(".status").forEach((element) => {
            element.addEventListener("click", async (event) => {
                const username = event.currentTarget.getAttribute("username");
                const status = event.currentTarget.checked;
                const response = await fetch(url + username.trim() + "/status", {
                    method: "PUT",
                    body: JSON.stringify(status),
                });
            });
        });

        // Download QR code
        document.querySelectorAll(".downloadQRCode").forEach((element) => {
            element.addEventListener("click", async (event) => {
                const username = event.currentTarget.getAttribute("username");
                const QRCode = await getQrCode(username);
                const el = document.createElement('a');
                el.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(QRCode)}`);
                el.setAttribute('download', username + '.conf');
                el.style.display = 'none';
                document.body.appendChild(el);
                el.click();
                document.body.removeChild(el);
            });
        });

        // Show QR code
        document.querySelectorAll('.showQRCode').forEach((element) => {
            element.addEventListener("click", async (event) => {
                const qrCodeHTML = document.getElementById("QRCode");
                const username = event.currentTarget.getAttribute("username");
                const text = await getQrCode(username);
                qrCodeHTML.innerText = "";

                new QRCode(qrCodeHTML, {
                    text,
                    width: 300,
                    height: 300,
                    colorDark : "#000000",
                    colorLight : "#ffffff",
                    correctLevel : QRCode.CorrectLevel.H
                });

                document.getElementById("modalTitle").innerText = username;
                new bootstrap.Modal('#modal', { keyboard: true }).show();
            });
        });

        // Delete client
        document.querySelectorAll('.basketClient').forEach((element) => {
            element.addEventListener("click", async (event) => {
                await fetch(url + event.currentTarget.getAttribute("username"), { method: "DELETE" });
                location.reload();
            });
        });
    }));

    // Add client
    document.querySelector("#addClient").addEventListener("click", async () => {
    const username = prompt("Write username").trim();
    await fetch(url, {
        method: "POST",
        headers: { 'Content-Type': 'application/json;charset=utf-8' },
        body: JSON.stringify({ username })
    });
    location.reload();
})
