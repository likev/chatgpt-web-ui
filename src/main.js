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

let conversationInfo = {};

async function getAnswer(fetch_body) {

    let f = await fetch(config['BINGAI-PROXY'], {
        "headers": {
            "content-type": "application/json; charset=utf-8",
        },
        "body": JSON.stringify({ ...conversationInfo, ...fetch_body }),
        "method": "POST",
        "mode": "cors"
    });

    /*
    {
    "message": "Hello, how are you today?",
    "conversationId": "your-conversation-id (optional)",
    "parentMessageId": "your-parent-message-id (optional, for `ChatGPTClient` only)",
    "conversationSignature": "your-conversation-signature (optional, for `BingAIClient` only)",
    "clientId": "your-client-id (optional, for `BingAIClient` only)",
    "invocationId": "your-invocation-id (optional, for `BingAIClient` only)",
}

// HTTP/1.1 200 OK
{
    "response": "I'm doing well, thank you! How are you?",
    "conversationId": "your-conversation-id",
    "messageId": "response-message-id (for `ChatGPTClient` only)",
    "conversationSignature": "your-conversation-signature (for `BingAIClient` only)",
    "clientId": "your-client-id (for `BingAIClient` only)",
    "invocationId": "your-invocation-id (for `BingAIClient` only - pass this new value back into subsequent requests as-is)",
    "details": "additional details about the AI's response (for `BingAIClient` only)"
}
    */
    let result = await f.json();

    let { clientId, conversationId, conversationSignature, invocationId } = result;
    conversationInfo = { clientId, conversationId, conversationSignature, invocationId };

    return result;
}

//
async function submitAskNormal() {
    //prevent double click
    $('#submit-ask').attr('disabled', 'disabled');

    const ask = $("#ask-content").val().trim();
    let fetch_body = { "message": promot + ask };

    //<div class="ask">This is some text within a card body.</div>
    //<div class="answer">This is some text within a card body.</div>
    $('#chat-content').append(`<div class="ask">${ask}</div>`);

    try {
        let result = await getAnswer(fetch_body);

        let { response, error } = result;

        if (error) {
            $('#chat-content').append(`<div class="alert alert-warning" role="alert">${error}</div>`);
        } else {//success
            $('#chat-content').append(`<div class="answer">${response}</div>`);

            $("#ask-content").val('');
        }

    } catch (err) {
        $('#chat-content').append(`<div class="alert alert-warning" role="alert">网络或服务器问题，请稍后重试！</div>`);
    } finally {
        $('#submit-ask').removeAttr('disabled');
    }

}

//Using server-sent events
async function submitAskSSE() {
    //prevent double click
    $('#submit-ask').attr('disabled', 'disabled');

    const ask = $("#ask-content").val().trim();
    let fetch_body = { "message": promot + ask };

    $('#chat-content').append(`<div class="ask">${ask}</div>`);

    let current_answer = $(`<div class="answer"></div>`)
    $('#chat-content').append(current_answer);

    try {
        let reply = '';

        const controller = new AbortController();
        await fetchEventSource(config['BINGAI-PROXY'], {
            //withCredentials: true,
            "headers": {
                "content-type": "application/json; charset=utf-8",
            },
            "body": JSON.stringify({ ...conversationInfo, ...fetch_body, stream: true }),
            "method": "POST",
            //"mode": "cors",
            openWhenHidden: true,

            signal: controller.signal,
            onopen(response) {
                if (response.status === 200) {
                    return;
                }
                throw new Error(`Failed to send message. HTTP ${response.status} - ${response.statusText}`);
            },
            onclose() {
                throw new Error(`Failed to send message. Server closed the connection unexpectedly.`);
            },

            onerror(message) {
                console.error(JSON.parse(message.data).error); // There was an error communicating with ChatGPT.;
            },

            onmessage(message) {
                // { data: 'Hello', event: '', id: '', retry: undefined }
                if (message.data === '[DONE]') {
                    controller.abort();

                    console.log(reply);

                    $("#ask-content").val('');
                    return;
                }

                if (message.event === 'result') {
                    const result = JSON.parse(message.data);
                    console.log(result);

                    let { clientId, conversationId, conversationSignature, invocationId, details } = result;
                    conversationInfo = { clientId, conversationId, conversationSignature, invocationId };

                    let {suggestedResponses, spokenText, text, sourceAttributions, adaptiveCards} = details;
                    let cards = adaptiveCards[0].body;
                    let cardsHTML = '';
                    for(let card of cards){
                        if(card.type === "TextBlock"){
                            cardsHTML += `<div class="AdaptiveCard TextBlock">${marked.parse(card.text)}</div>`;
                        }
                    }
                    current_answer.html(`<div class="AdaptiveCards">${cardsHTML}</div>`);

                    return;
                }

                console.log(message);
                reply += message.data;

                current_answer.html(marked.parse(reply));
            }

        })
    } catch (err) {
        $('#chat-content').append(`<div class="alert alert-warning" role="alert">网络或服务器问题，请稍后重试！</div>`);
    } finally {
        $('#submit-ask').removeAttr('disabled');
    }
}

$('#submit-ask').on('click', submitAskSSE) //or $('#submit-ask').on('click', submitAskNormal)

//document is ready
$(function () {
    $('#chat-content').empty();

    $("#ask-content").val('介绍一下你自己');
    $('#submit-ask').trigger('click');
})
