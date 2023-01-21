import { useContext, useEffect, useCallback, useState } from 'react';
import './styles.css'
import CredentialAPI from 'api/credential';
import { SessionContext } from "contexts/session";
import { MeContext } from 'contexts/me';
import usePublisher from 'hooks/publisher';
import Home from './components/Home';
import Room from './components/Room';
import FullPageLoading from 'components/FullPageLoading';

interface IRoom {
    name: string
    key: string
}

function Main(){

    const mSession = useContext(SessionContext);
    const mMe = useContext(MeContext);
    const [ homeVisible, setHomeVisible] = useState<boolean>(true);
    const [ roomVisible, setRoomVisible] = useState<boolean>(false);
    const [ isLoading, setIsLoading] = useState<boolean>(false);

    const [ room, setRoom] = useState<IRoom| null>(null);
    const { publish: publishCamera, unpublish: unpublishCamera, publisher: cameraPublisher } = usePublisher({containerId: "cameraContainer"});


    const connectSession = useCallback( async () => {
        if (!room) return;
        const roomName = room.name;
        const key = room.key;
        const credential = await CredentialAPI.generateCredential({
            role: 'publisher',
            data: {user: mMe.user},
            roomName: roomName
          });
          mSession.connectWithCredential({credential, key});
    }, [room, mSession, mMe.user])

    useEffect(() => {
        if (mMe.user && room) {
            setIsLoading(true);
            connectSession();
        }
    }, [mMe.user, room, connectSession])

    const publishErrorListener = useCallback(
        (error: any) => {
          alert(`publish failed: ${error.message}`)
        },
        []
    );

    const publish = useCallback(() => {
        if (mSession.session && mSession.session.capabilities.publish === 1 && mMe.user) {
            publishCamera({
                session: mSession.session,
                userName: mMe.user.name,
                onError: publishErrorListener
            })
        }
        else {
            return alert("You don't have pulish capabilities")
        }
    }, [mSession.session, publishErrorListener, publishCamera, mMe.user])

    useEffect(() => {
        if (mSession.session) {
            publish();
            setHomeVisible(false);
            setRoomVisible(true);
            setIsLoading(false);
        }
    }, [mSession.session, publish, mSession.e2eeEnable])


    return (
        <>
        {isLoading ? <FullPageLoading></FullPageLoading> : null}
        <Home visible={homeVisible} setRoom={setRoom}></Home>
        <Room visible={roomVisible} room={room}></Room>
        </>
    )
}
export default Main;
