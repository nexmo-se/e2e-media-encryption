import AvatarImage from "assets/img/avatar.png";
import { createContext, ReactNode, useRef, useState, useContext, useCallback, useEffect } from 'react';
import Credential from 'entities/credential';
import { Session, Subscriber, Stream, WidgetProperties } from '@opentok/client';
import OT from '@opentok/client';
import { resolveCname } from "dns/promises";

interface SessionContextProviderProps {
    containerId: string
    children: ReactNode
}

interface ICredential {
    credential: Credential
    key: string | undefined
}
interface ISessionContext {
    e2eeEnable: boolean;
    connected: boolean;
    session: Session | null;
    subscribers: Subscriber[];
    streams: Stream[];
    connectWithCredential: ({credential, key}: ICredential) => Promise<Session | void>;
    addStream: ({stream}: {stream:Stream}) => void;
    removeStream: ({stream}: {stream:Stream}) => void;
    changeEncryptionKey: (key: string) => Promise<string>;
    e2eeEnableState: (state: boolean) => void;
}

const sessionInfo:ISessionContext = {
    e2eeEnable: false,
    connected: false,
    session: null,
    subscribers: [],
    streams: [],
    connectWithCredential: ({credential, key}: ICredential) => Promise.resolve(),
    addStream: ({stream}: {stream:Stream}) => {},
    removeStream: ({stream}: {stream:Stream}) => {},
    changeEncryptionKey: (key: string) => Promise.resolve(''),
    e2eeEnableState: (state: boolean) => {}
}

// use for calling
export const SessionContext = createContext<ISessionContext>(sessionInfo)

// Use for wrapping
export const SessionContextProvider = ({containerId, children}: SessionContextProviderProps) => {
    const [ e2eeEnable, setE2eeEnable] = useState<boolean>(false);
    const [connected, setConnected] = useState<boolean>(false);
    const [streams, setStreams] = useState<Stream[]>([]);
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const sessionRef = useRef<Session| null>(null);

    const subscribe = useCallback(
        async (stream: Stream) => {
          const extraData = {};
          const finalOptions: WidgetProperties = Object.assign({}, extraData, {
            insertMode: 'append' as const,
            style: {
              buttonDisplayMode: 'off',
              nameDisplayMode: 'on',
              backgroundImageURI: AvatarImage
            }
          });
          const subscriber: Subscriber = await new Promise((resolve, reject) => {
            if (sessionRef.current) {
              const subscriber = sessionRef.current.subscribe(
                stream,
                containerId,
                finalOptions,
                (err) => {
                  if (err) {
                    alert(`Failed to subscribe ${stream.name}: ${err.message}`)
                    reject(err)
                  }
                  else {
                    resolve(subscriber);
                  }
                }
              );
              subscriber.on("encryptionSecretMatch", () => {
                console.log(`subscriber ${subscriber.stream?.name} secret match`)
                updateSubscriberMask(subscriber, false)
              })
              subscriber.on("encryptionSecretMismatch", () => {
                alert(`subscriber ${subscriber.stream?.name} secret mismatch`)
                updateSubscriberMask(subscriber, true)
              })
            } else reject();
          });
         
            setSubscribers((prev) => [...prev, subscriber]);
        },
        [containerId]
      );
      const unsubscribe = useCallback((stream: Stream) => {
        setSubscribers((prev) => {
          return prev.filter((prevSubscriber) => {
            if (prevSubscriber.stream === undefined || prevSubscriber.id === null) return false;
            else if (prevSubscriber.stream.streamId === stream.streamId) return false;
            else return true;
          });
        });
      }, []);
    


    function addStream({stream}: {stream:Stream}) {
        setStreams((prev) => [...prev, stream]);
      }
    
    function removeStream({stream}: {stream:Stream}) {
        setStreams((prev) =>
        prev.filter((prevStream) => prevStream.streamId !== stream.streamId)
    );
    }

    function e2eeEnableState(state: boolean) {
      setE2eeEnable(state);
    }

    async function changeEncryptionKey(key: string) {
      return new Promise<string>(async (resolve, reject) => {
        if (sessionRef.current) {
          await sessionRef.current.setEncryptionSecret(key);
          resolve(key);
        }
        else {
          resolve('You are not joining a session.');
        }
      })

    }

    const streamCreatedListener = useCallback(({stream}: {stream:Stream}) => {
      console.log("stream", stream);
        subscribe(stream);
        setStreams((prev) => [...prev, stream]);
        // subscribe(stream)
    }, [subscribe])

    const streamDestroyedListener = useCallback(
        ({stream}: {stream:Stream}) => {
          unsubscribe(stream);
          setStreams((prev) =>
            prev.filter((prevStream) => prevStream.streamId !== stream.streamId)
          );
        },
        [unsubscribe]
    );

    const connectWithCredential = useCallback(async ({credential, key}: ICredential) => {
        if (!sessionRef.current) {
        setConnected(false);

        if (e2eeEnable) {
          sessionRef.current = OT.initSession(
              credential.apiKey,
              credential.sessionId,
              {
                  encryptionSecret: key
              }
          );
        }
        else {
          sessionRef.current = OT.initSession(
            credential.apiKey,
            credential.sessionId
        );
        }

        // sessionRef.current.on('connectionCreated', connectionCreatedListener);
        // sessionRef.current.on('connectionDestroyed',connectionDestroyedListener);
        sessionRef.current.on('streamCreated', streamCreatedListener);
        sessionRef.current.on('streamDestroyed', streamDestroyedListener);

        await new Promise<void>((resolve, reject) => {
            sessionRef.current?.connect(credential.token, (err) => {
            if (err) {
                alert(err.message)
                reject(err);
            }
            else resolve();
            });
        });
        setConnected(true);
        return sessionRef.current;
        } else return sessionRef.current;
    }, [
        streamCreatedListener,
        streamDestroyedListener,
        e2eeEnable
    ])


  function updateSubscriberMask(subscriber: Subscriber, isMismatch: Boolean) {
    if (!subscriber.id) return

    if (isMismatch) {
      const targetDom = document.getElementById(subscriber.id);
      if (targetDom) insertMismatchMask(subscriber, targetDom);
    }
    else {
      const targetDom = document.getElementById(`${subscriber.id}-mask`);
      if (targetDom) targetDom.remove();
    }
  }

  function insertMismatchMask(subscriber: Subscriber, targetDom: HTMLElement) {
    if (document.getElementById(`${subscriber.id}-mask`)) return;
      const childNodeStr = `<div
      id=${subscriber.id}-mask
      style="
      position: absolute; 
      top: 0px; 
      left: 0px;
      font-size: 25px;
      height: 100%;
      width: 100%;
      background-color: rgb(0,0,0,0.7);
      color: white;
      border: 1px solid red;
      border-style: inset;
      line-height: 100%;
      vertical-align: middle;
      ">
        <p
        style="
        position: absolute; 
        top: 45%; 
        left: 0px;
        text-align: center;
        width: 100%;
        ">Key Mismatch</p>
      </div>`;
      targetDom.insertAdjacentHTML('beforeend', childNodeStr);
  }

    return (
        <SessionContext.Provider value={{
                session: sessionRef.current,
                connected,
                subscribers,
                streams,
                e2eeEnable,
                connectWithCredential,
                addStream,
                removeStream,
                changeEncryptionKey,
                e2eeEnableState
            }}>
            {children}
        </SessionContext.Provider>
    )

}
