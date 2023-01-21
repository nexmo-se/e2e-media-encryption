// @flow
import AvatarImage from "assets/img/avatar.png";

import { useContext, useRef, useCallback } from "react";
import OT from "@opentok/client";
import { SessionContext } from "contexts/session";
import { Session, Publisher, Stream } from "@opentok/client";
import delay from "delay";

interface BasePublishOptions {
  session: Session;
}

interface UnpublishOptions extends BasePublishOptions {};
interface PublishOptions extends BasePublishOptions {
  userName: string;
  extraData?: any;
  onError?: ((error: any) => void) | ((error: any) => Promise<void>) | null;
  attempt?: number;
  videoSource?: String
}

interface IReturnValue {
  publish: (args: PublishOptions) => Promise<Publisher| void>;
  unpublish: (args: UnpublishOptions) => Promise<void>;
  publisher?: Publisher;
}

interface IPublisher{
  containerId: string
  autoLayout?: boolean;
  name?: string;
}

function usePublisher({containerId, autoLayout = true, name }: IPublisher): IReturnValue{
 const mSession = useContext(SessionContext);
 const { addStream, removeStream } = mSession;
  const publisherRef = useRef<Publisher>();

  const streamCreatedListener = useCallback(
    ({stream}: {stream: Stream}) => {
      addStream({stream});
    },
    [addStream]
  )

  const streamDestroyedListener = useCallback(
    ({stream}: {stream: Stream}) => {
      removeStream({stream});
    },
    [removeStream]
  )

  const publish = useCallback(
    async ({ session, userName, extraData, attempt = 1, onError }: PublishOptions): Promise<Publisher | void> => {
      console.log(`Attempting to publish in ${attempt} try`)

      if (!publisherRef.current) {
        const options: any = { 
          insertMode: "append",
          name: name? name: userName,
          style: { 
            buttonDisplayMode: "off",
            nameDisplayMode: "on",
            backgroundImageURI: AvatarImage
          }
        };

        const finalOptions = Object.assign({}, options, extraData);
        publisherRef.current = OT.initPublisher(containerId, finalOptions);

        if (publisherRef.current) {
          publisherRef.current.on("streamCreated", streamCreatedListener);
          publisherRef.current.on("streamDestroyed", streamDestroyedListener);
        }

        const { retry, error } = await new Promise(
          (resolve, reject) => {
            if (publisherRef.current) {
              session.publish(
                publisherRef.current,
                (err) => {
                  if (err && err.name === "OT_STREAM_CREATE_FAILED") {
                    resolve({ retry: false, error: err });
                  }
                  if (err && attempt < 3) {
                    publisherRef.current = undefined;
                    resolve({ retry: true, error: err });
                  } if (err && attempt >= 3) {
                    resolve({ retry: false, error: err });
                  } else resolve({ retry: false, error: undefined });
                }
              )
            }
          }
        )

        if (retry) {
          // Wait for 2 seconds before attempting to publish again
          await delay(2000 * attempt);
          await publish({
            session,
            userName,
            extraData,
            onError,
            attempt: attempt + 1,
          });
        } else if (error) {
          publisherRef.current = undefined;
          if (onError) await onError(error);
          return undefined;
        } else {
          return publisherRef.current;
        }
      } else return publisherRef.current;

      
    },
    [
      containerId,
      name,
      streamCreatedListener,
      streamDestroyedListener
    ]
  );

  const unpublish =  useCallback(
    async ({ session }: UnpublishOptions) => {
      if (publisherRef.current) session.unpublish(publisherRef.current);
      if (publisherRef.current) publisherRef.current.destroy()
      publisherRef.current = undefined;
    },
    []
  );

  return { 
    publisher: publisherRef.current,
    publish,
    unpublish
  }
}
export default usePublisher;