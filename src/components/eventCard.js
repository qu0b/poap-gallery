import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faGlobe, faHashtag, faLaptop, faClock, faFire } from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState } from "react";
import { MultiLineEllipsis } from './multiLineEllipsis';
import { Pill } from './pill';
import { useWindowWidth } from '@react-hook/window-size/throttled';
import ReactModal from 'react-modal';
import Power from '../assets/images/power.svg';
import Transfers from '../assets/images/transfers.svg';
import Supply from '../assets/images/supply.svg';

export function EventCard({ event, size = 's', type = '', power = 0}) {
  const width = useWindowWidth();
  const validateType = (type) => {
    if (size !== 'm') return '';
    if (type !== 'most-recent' && type !== 'upcoming' && type !== 'most-claimed') return '';
    return type;
  }

  type = validateType(type);

  return (
    <Link to={'/event/' + event.id} className={`
      gallery-card
      ${(size === 'l') ? 'large' : (size === 'm') ? 'medium' : 'small'}`}>
      <Header event={event} type={type} />
      <Content event={event} type={type} width={width} size={size} power={power} />
    </Link>
  );
}

function Header({type, event}) {
    const [isOpen, setOpen] = useState(!true)
    const toggleModal = () => {
        setOpen(!isOpen)
    }

    return <div className={`header ${type}`} onClick={toggleModal}>
      <span onClick={toggleModal}>
        <img
            src={event.image_url}
            alt="POAP" />
      </span>
        <ReactModal
            isOpen={isOpen}
            contentLabel="Fullscreen event image"
            onRequestClose={toggleModal}
        >
            <img
                src={event.image_url}
                alt="POAP" />
        </ ReactModal>
    </div>
}

function Content({type, width, size, event, power}) {
    const [tokenCount, setTokenCount] = useState(0);
    const [transferCount, setTransferCount] = useState(0);

    useEffect(() => {
        if (event.tokenCount && event.tokenCount > tokenCount) {
            setTokenCount(event.tokenCount)
        }
    }, [event, tokenCount])
    useEffect(() => {
        if (event.transferCount && event.transferCount > transferCount) {
            setTransferCount(event.transferCount)
        }
    }, [event, transferCount])

    const nl2br = (text) => (text.split('\n').map((item, key) => {
        return <>{item}<br/></>
    }));

    return (
        <div className="content">
            <div
                className="content-first"
                style={{
                    overflow: 'hidden',
                    width: '100%',
                    padding: '1rem'
                }}>

                {/* event type */}
                <div className={`${type === '' ? 'hidden' : 'pill event-type'} ${type}`}>
                    {
                        type === 'most-recent' ? <div><FontAwesomeIcon style={{ width: '1rem', marginRight: '.2rem' }} icon={faClock} />Most recent</div> :
                            type === 'upcoming' ? <div><FontAwesomeIcon style={{ width: '1rem', marginRight: '.2rem' }} icon={faCalendar} />Upcoming</div> :
                                type === 'most-claimed' ? <div><FontAwesomeIcon style={{ width: '1rem', marginRight: '.2rem' }} icon={faFire} />Most claimed</div> :
                                    ''
                    }
                </div>

                {/* title */}
                <h3
                    className="h4 content-title"
                    style={{
                        fontSize: '1rem',
                        textAlign: 'center',
                        margin: '8px 0 0 0',
                        overflowWrap: 'anywhere',
                    }}>
                    <MultiLineEllipsis text={event.name} lines={2} maxLengthPerLine={(size === 'l' ? (width >= 768 ? 403 : width >= 480 ? 303 : 203) : size === 'm' ? 262 : 229)}/>
                </h3>

                {/* description */}
                {
                  size === 'l' ?
                      <div className='content-description'>
                        <div className='content-description-main'>{nl2br(event.description)}</div>
                        <span onClick={() => window.open(event.event_url, '_blank')} className='content-description-url ellipsis' target="_blank"  rel="noopener noreferrer">{event.event_url}</span>
                      </div>
                      :
                      /* id */
                      <div className='content-id'>
                        <FontAwesomeIcon style={{ width: '0.5rem' }} icon={faHashtag} />
                        {event.id}
                      </div>
                }

                {/* time and place */}
                <div className="content-time-place">
                    <Pill style={{ minWidth: '100px'}} text={event.start_date} icon={faCalendar} />
                    <Pill className="ellipsis" tooltip={true}
                          icon={event.city ? faGlobe : faLaptop}
                          text={event.city ? event.city : 'Virtual event '}/>
                </div>
            </div>

            {size !== 'l' && <hr />}

            <div
                className="content-second"
                style={{
                    overflow: 'hidden',
                    width: '100%',
                    padding: '1rem'
                }}>
                {/* supply y transfers */}
                <div>
                    <div className="title">
                        <img style={{ width: '0.7rem', marginRight: '.4rem' }} src={Supply} alt='Supply' />{'SUPPLY'}
                    </div>
                  <span className='supply-content' style={{width: 'fit-content'}}>
                    {tokenCount === undefined ? ' -' : tokenCount === 0 ? ' None Claimed' : tokenCount}
                  </span>
                </div>
                {
                    size === 'l' &&
                    <div>
                        <div className="title">
                            <img style={{ width: '0.7rem', marginRight: '.4rem' }} src={Power} alt='Power' />{'POWER'}
                        </div>
                        {power}
                    </div>
                }
                <div>
                    <div className="title">
                        <img style={{ width: '0.7rem', marginRight: '.4rem' }} src={Transfers} alt='Transfers' />{'TRANSFERS'}
                    </div>
                    {transferCount}
                </div>
            </div>
        </div>
    )
}