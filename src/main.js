import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

import jquery from "jquery/src/jquery.js";
import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js';
//import moment from 'moment';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { marked } from 'marked';

window.$ = jquery;
window.bootstrap = bootstrap;

import config from './config';
//import { fixedEncodeURIComponent, getUTCTimeStr } from "./utils"

let promot = "";
$('#select-ai-role').on('change', function () {
    promot = config.roles[this.value];
})

let conversationInfo = {}, turnsCount = 0;
const turnTimeout = 30, resetTurns = 5;//every 5 turns reset conversationInfo;

function prepareAnswer(UUID, fetch_body) {

    return fetch(`${config['BINGAI-PROXY']}/${UUID}`, {
        "headers": {
            "content-type": "application/json; charset=utf-8",
        },
        "body": JSON.stringify({ ...conversationInfo, ...fetch_body }),
        "method": "POST",
        "mode": "cors"
    });
}

//Using server-sent events
async function submitAskPolling() {
    //prevent double click
    $('#submit-ask').attr('disabled', 'disabled');

    const ask = $("#ask-content").val().trim();
    let fetch_body = { "message": promot + ask, stream: true };

    $('#chat-content').append(`<div class="ask">${ask}</div>`);

    let current_answer = $(`<div class="answer"></div>`)
    $('#chat-content').append(current_answer);

    try {
        let reply = '';
        let UUID = self.crypto.randomUUID();
        //console.log(uuid); // for example "36b8f84d-df4e-4d49-b662-bcde71a8764f"

        prepareAnswer(UUID, fetch_body);//first POST

        let lastID = 0, polling = true;

        setTimeout(_ => {//stop polling if no response after turnTimeout
            if (lastID === 0) polling = false;
        }, turnTimeout * 1000)

        while (polling) {
            try {
                let f = await fetch(`${config['BINGAI-PROXY']}/${UUID}/${lastID}?_t=${performance.now()}`, {
                    "mode": "cors"
                });

                let message = await f.json();

                lastID = onmessage(message);
                if (lastID === -1) polling = false;
            } catch (e) {
                polling = false;
            }
        }

        function onmessage(message) {
            if (message.event === 'error') {
                const error = JSON.parse(message.data);
                console.error(error); // There was an error communicating with ChatGPT.;

                if (error.code === 404) {
                    return 0;//get maybe quicker than post
                }

                return -1;
            }

            if (message.event === 'result') {
                const result = JSON.parse(message.data);
                console.log(result);

                let { clientId, conversationId, conversationSignature, invocationId, details } = result;
                conversationInfo = { clientId, conversationId, conversationSignature, invocationId };

                turnsCount++;

                if (turnsCount % resetTurns === 0) conversationInfo = {};

                let { suggestedResponses, spokenText, text, sourceAttributions, adaptiveCards } = details;
                let cards = adaptiveCards[0].body;
                let cardsHTML = '';
                for (let card of cards) {
                    if (card.type === "TextBlock") {
                        cardsHTML += `<div class="AdaptiveCard TextBlock">${marked.parse(card.text)}</div>`;
                    }
                }
                current_answer.html(`<div class="AdaptiveCards">${cardsHTML}</div>`);

                $("#ask-content").val('');
                return -1;
            }

            console.log(message);
            reply += message.data;

            current_answer.html(marked.parse(reply));

            return message.id;
        }
    } catch (err) {
        $('#chat-content').append(`<div class="alert alert-warning" role="alert">网络或服务器问题，请稍后重试！</div>`);
    } finally {
        $('#submit-ask').removeAttr('disabled');
    }
}

$('#submit-ask').on('click', submitAskPolling);

//document is ready
$(function () {
    $('#chat-content').empty();

    $("#ask-content").val('');
    //$('#submit-ask').trigger('click');
})
