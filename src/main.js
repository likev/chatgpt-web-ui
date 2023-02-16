import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

import jquery from "jquery/src/jquery.js";
import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js';
//import moment from 'moment';

window.$ = jquery;
window.bootstrap = bootstrap;

import config from './config';
//import { fixedEncodeURIComponent, getUTCTimeStr } from "./utils"

let promot = "";
$('#select-ai-role').on('change', function(){
    promot = config.roles[this.value];
})

let conversationInfo = {};

async function getAnswer(fetch_body) {

    let f = await fetch(config['BINGAI-PROXY'], {
        "headers": {
            "content-type": "application/json; charset=utf-8",
        },
        "body": JSON.stringify({...conversationInfo, ...fetch_body}),
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

    let {clientId, conversationId, conversationSignature, invocationId} = result;
    conversationInfo = {clientId, conversationId, conversationSignature, invocationId};

    return result;
}

$('#submit-ask').on('click', async function(){
    //prevent double click
    $('#submit-ask').attr('disabled', 'disabled');

    const ask = $("#ask-content").val().trim();
    let fetch_body = {"message": promot + ask};
    
    //<div class="ask">This is some text within a card body.</div>
    //<div class="answer">This is some text within a card body.</div>
    $('#chat-content').append(`<div class="ask">${ask}</div>`);

    try{
        let result = await getAnswer(fetch_body);
    
        let {response, error} = result;

        if(error){
            $('#chat-content').append(`<div class="alert alert-warning" role="alert">${error}</div>`);
        }else{//success
            $('#chat-content').append(`<div class="answer">${response}</div>`);

            $("#ask-content").val('');
        }
        
    }catch{
        $('#chat-content').append(`<div class="alert alert-warning" role="alert">网络或服务器问题，请稍后重试！</div>`);
    }finally {
        $('#submit-ask').removeAttr('disabled');
    }

})

//document is ready
$(function(){
    $('#chat-content').empty();

    $("#ask-content").val('介绍一下你自己');
    $('#submit-ask').trigger('click');
})
