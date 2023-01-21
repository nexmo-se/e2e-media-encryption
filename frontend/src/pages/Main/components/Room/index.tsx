
import { useContext } from 'react';
import LayoutContainer from "components/LayoutContainer";
import { SessionContext } from 'contexts/session';
import './styles.css'
import SetKey from "components/SetKey"

interface IRoom {
    name: string
    key: string
}

interface IRoomProps {
    visible: boolean
    room: IRoom | null
}

function Room({visible, room}: IRoomProps) {
    const mSession = useContext(SessionContext);
    let visibleState = 'hidden';
    if (visible) {
        visibleState = 'shown'
    }
    return (
        <div className={`room ${visibleState}`}>
            {room? <p className="roomNameBanner">Room: {room.name}</p> : null}
            <LayoutContainer
            id="cameraContainer"
            size="big"
            />
        {mSession.e2eeEnable? <SetKey></SetKey> : null}
        </div>
    )
}
export default Room;