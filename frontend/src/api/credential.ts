import Credential from "entities/credential";

interface ICredential {
    role: "publisher" | "moderator" | "subscriber";
    data: any;
    roomName: string;
}
const url = new URL(window.location.href);
const serverPath = process.env.REACT_APP_API_URL || `${url.protocol}//${url.hostname}:${url.port}`;

export default class CredentialAPI {
    static async generateCredential({ role = "publisher", data = {}, roomName}: ICredential){
        const response = await fetch(`${serverPath}/rooms/${roomName}`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({role, data})
        })
        if (response.ok) {
            const jsonResponse = await response.json();
            const credential = new Credential(jsonResponse.apiKey, jsonResponse.sessionId, jsonResponse.token);
            return credential;
        }
        else throw new Error(response.statusText)
    }
}