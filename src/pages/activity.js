import React, {useEffect, useState} from 'react'
import ReactTooltip from 'react-tooltip';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faAngleDown, faAngleUp, faDotCircle, faQuestionCircle} from '@fortawesome/free-solid-svg-icons';
import {Helmet} from 'react-helmet'
import {useDispatch, useSelector} from 'react-redux';
import {fetchIndexData, selectMostClaimed, selectMostRecent, selectUpcoming} from '../store';
import {getMainnetTransfers, getxDaiTransfers, POAP_API_URL} from "../store/api";
import {EventCard} from "../components/eventCard";
import { Pill } from '../components/pill';
import Migration from '../assets/images/migrate.svg'
import Burn from '../assets/images/burn.svg'
import Claim from '../assets/images/claim.svg'
import Transfer from '../assets/images/transfer.svg'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Foliage } from '../components/foliage';
import { shrinkAddress, transferType } from '../utilities/utilities';
import { useWindowWidth } from '@react-hook/window-size/throttled';
import { Link } from 'react-router-dom'

dayjs.extend(relativeTime)

export default function Activity() {
  const dispatch = useDispatch()

  // Meanwhile get all the events
  useEffect(() => {
    dispatch(fetchIndexData());
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  const [loading, setLoading] = useState(false)
  const [transfers, setTransfers] = useState([])
  const [daitransfers, setDaiTransfers] = useState([])
  const [mainnetTransfers, setMainnetTransfers] = useState([])

  const mostClaimed = useSelector(selectMostClaimed)
  const mostRecent = useSelector(selectMostRecent)
  const upcoming = useSelector(selectUpcoming)
  const transferLimit = 15

  useEffect(() => {
      setLoading(true)
      getMainnetTransfers(transferLimit)
        .then(
          (result) => {
            let transfers = result.data.transfers
            setMainnetTransfers(transfers)
            setLoading(false)
          },
          (error) => {
            setLoading(false)
            console.log('failed to query the graph',error)
          },
        );
  }, []);

  useEffect(() => {
      setLoading(true)
      getxDaiTransfers(transferLimit)
        .then(
          (result) => {
            let transfers = result.data.transfers
            setDaiTransfers(transfers)
            setLoading(false)
          },
          (error) => {
            setLoading(false)
            console.log('failed to query the graph',error)
          },
        );
  }, []);

  useEffect(() => {
    let transfers = daitransfers.concat(mainnetTransfers)
    transfers.sort((a, b) => {
      return b.timestamp - a.timestamp
    })
    setTransfers(transfers.slice(0, transferLimit))
  }, [daitransfers, mainnetTransfers])

  return (
    <main id="site-main" role="main" className="app-content activity-main">
      <Helmet>
        <title>POAP Gallery - Activity</title>
        <link rel="canonical" href="https://poap.gallery/activity"/>
        <meta property="og:url" content="https://poap.gallery/activity"/>
        <meta property="og:title" content="POAP Gallery - Activity"/>
      </Helmet>
      <Foliage />
      <div className="activityContainer container" style={{
        maxWidth: 'none'
      }}>

        <div className="gallery-grid activity-grid" style={{ padding: '0 4rem', display: 'grid', justifyContent: 'center', gridAutoColumns: 295 }}>
          <EventCard event={mostRecent} size='m' type='most-recent' />
          <EventCard event={upcoming} size='m' type='upcoming' />
          <EventCard event={mostClaimed} size='m' type='most-claimed' />
        </div>

        <div className='table-container' style={{ marginTop: 50}}>
          <CreateTable loading={loading} transfers={transfers} />
        </div>

      </div>
    </main>
  )
}

function TokenRow({transfer, dateFormat}) {
  const type = transferType(transfer)
  const width = useWindowWidth()
  const [expanded, setExpanded] = useState(false)
  const toggleRowExpand = () => {
    setExpanded(!expanded)
  }
  const dateCell = (cell) => {
    if (dateFormat === 'date') {
      return dayjs(cell.value).format('D-MMM-YYYY').toUpperCase();
    }
    return dayjs(cell.value).fromNow()
  }
  return (
    width > 780
    ? <tr>
      <td className='recent-activity' style={{width:'100%'}}>
        {
          (type === 'Migration') ? <img src={Migration} alt="Migration" /> :
          (type === 'Claim') ? <img src={Claim} alt="Claim" /> :
          (type === 'Burn') ? <img src={Burn} alt="Burn" /> :
          <img src={Transfer} alt="Transfer" />
        }
        <a
          className='recent-activity-image'
          href={"https://app.poap.xyz/token/"+transfer.token.id} target="_blank"  rel="noopener noreferrer">
          <img style={{
            width: 80,
            height: 80,
            objectFit: 'cover',
            borderRadius: '50%',
            margin: '0 24px 0 14px'
          }} src={`${POAP_API_URL}/token/${transfer.token.id}/image`} alt=""/>
        </a>
        <div className='recent-activity-content'>
          <div className='activity-type-pill'><Pill className={type} text={type} tooltip={false} /></div>
          <div className='time ellipsis'>{dayjs(transfer.timestamp * 1000).fromNow()}</div>
          <div className='description'>{
            (type === 'Migration') ? 'POAP migrated to mainnet' :
            (type === 'Claim') ? <div>New claim on event{' '}<Link to={`/event/${transfer.token.event.id}`}>#{transfer.token.event.id}</Link></div> :
            (type === 'Burn') ? <div>POAP burned on event{' '}<Link to={`/event/${transfer.token.event.id}`}>#{transfer.token.event.id}</Link></div> :
            <div>POAP transferred from 
              <a href={`https://app.poap.xyz/scan/${transfer.from.id}`} target="_blank"  rel="noopener noreferrer"> {shrinkAddress(transfer.from.id, 10)} </a> to
              <a href={`https://app.poap.xyz/scan/${transfer.to.id}`} target="_blank"  rel="noopener noreferrer"> {shrinkAddress(transfer.to.id, 10)}</a>
            </div>
          }</div>
        </div>
      </td>
      <td className='ellipsis'><a href={"https://app.poap.xyz/token/" + transfer.token.id} target="_blank"  rel="noopener noreferrer">{'#'}{transfer.token.id}</a></td>
      <td style={{minWidth: '50px'}}><a href={"https://app.poap.xyz/scan/" + transfer.to.id} target="_blank"  rel="noopener noreferrer">
          <span>{shrinkAddress(transfer.to.id, 15)}</span>
        </a></td>
      <td> {transfer.token.transferCount && transfer.token.transferCount > 0 ? transfer.token.transferCount : 'Claimed'} </td>
      <td style={{wordBreak: 'break-all'}} > { dateCell(transfer.timestamp * 1000) } </td>
    </tr>
    : <tr>
      <td className='mobile-row'>
        <div className='recent-activity' style={{width:'100%'}}>
          {
            (type === 'Migration') ? <img src={Migration} alt="Migration" /> :
            (type === 'Claim') ? <img src={Claim} alt="Claim" /> :
            (type === 'Burn') ? <img src={Burn} alt="Burn" /> :
            <img src={Transfer} alt="Transfer" />
          }
          {
            width > 430 &&
            <a
              className='recent-activity-image'
              href={"https://app.poap.xyz/token/"+transfer.token.id} target="_blank"  rel="noopener noreferrer">
              <img style={{
                width: 80,
                height: 80,
                objectFit: 'cover',
                borderRadius: '50%',
                margin: '0 24px 0 14px'
              }} src={`${POAP_API_URL}/token/${transfer.token.id}/image`} alt=""/>
            </a>
          }
          <div className='recent-activity-content'>
            <div className='activity-type-pill'><Pill className={type} text={type} tooltip={false} /></div>
            <div className='time ellipsis'>{dayjs(transfer.timestamp * 1000).fromNow()}</div>
            <div className='description'>{
              (type === 'Migration') ? 'POAP migrated to mainnet' :
              (type === 'Burn') ? <span>POAP burned on event{' '}<Link to={`/event/${transfer.token.event.id}`}>#{transfer.token.event.id}</Link></span> :
              (type === 'Claim') ? <span> New claim on event{' '}<Link to={`/event/${transfer.token.event.id}`}>#{transfer.token.event.id}</Link></span> :
              <span>POAP transferred from 
                <a href={`https://app.poap.xyz/scan/${transfer.from.id}`} target="_blank"  rel="noopener noreferrer"> {shrinkAddress(transfer.from.id, 10)} </a> to
                <a href={`https://app.poap.xyz/scan/${transfer.to.id}`} target="_blank"  rel="noopener noreferrer"> {shrinkAddress(transfer.to.id, 10)}</a>
              </span>
            }</div>
          </div>
          <span className='expand-button' style={{width: `calc(100% - 180px${width>430?' - 118px':''})`}}><FontAwesomeIcon onClick={toggleRowExpand} icon={expanded? faAngleUp:faAngleDown} /></span>
        </div>
        <div className={`mobile-row-content ${expanded ? 'open' : ''}`}>
          <span className='id-title'>POAP ID</span><span className='id-content'><a href={"https://app.poap.xyz/token/" + transfer.token.id} target="_blank"  rel="noopener noreferrer">{'#'}{transfer.token.id}</a></span>
          <span className='address-title'>Owner</span><span className='address-content ellipsis'><a href={"https://app.poap.xyz/scan/" + transfer.to.id} target="_blank"  rel="noopener noreferrer">
              <span>{
                width>480
                ? shrinkAddress(transfer.to.id, 25)
                : shrinkAddress(transfer.to.id, 10)}
              </span>
            </a></span>
          <span className='tr-count-title'>Transaction Count</span><span className='tr-count-content'>{transfer.token.transferCount}</span>
          <span className='claim-title'>Minting Date</span><span className='claim-content'>{ dayjs(transfer.timestamp * 1000).format('D-MMM-YYYY').toUpperCase() }</span>
        </div>
      </td>
    </tr>
  )
}

function CreateTable({transfers, loading}) {
  const [dateFormat, setDateFormat] = useState('timeago')
  const width = useWindowWidth();
  const toggleDateFormat = () => {
    dateFormat === 'timeago' ? setDateFormat('date') : setDateFormat('timeago')
  }
  const tfers = []
  for (let i = 0; i < transfers.length; i++) {
    const t = transfers[i];
    tfers.push(<TokenRow key={t.id} transfer={t} dateFormat={dateFormat}/>)
  }
  if (tfers && tfers.length) {
    tfers.push(
      width>780
      ?<tr key={tfers.length} ><td/><td/><td/><td/><td/></tr>
      :<tr key={tfers.length}><td/></tr>)
  }
  return (
    <div style={{width: '100%'}} className='activity-table-container'>
      <table className="table" style={{ width: '100%', fontSize: '.93rem' }}>
        <thead>
          {
            width > 780
            ?<tr>
              <th style={{paddingLeft: '20px', textAlign: 'start'}}>Recent Activity</th>
              <th>POAP ID</th>
              <th>Collection</th>
              <th>TX count <FontAwesomeIcon icon={faQuestionCircle} data-tip="The amount of transactions this POAP has done since it the day it been claimed." /><ReactTooltip effect='solid'/> </th>
              <th>Minting Date <FontAwesomeIcon icon={faDotCircle} onClick={toggleDateFormat} data-tip="Toggle date format" style={{ width: '1rem', marginRight: '.2rem', cursor: 'pointer' }} /><ReactTooltip effect='solid'/></th>
            </tr>
            : <tr>
              <th style={{width: '100%'}}/>
            </tr>
          }
        </thead>
        <tbody>
          {loading ? <tr style={{height: '600px', width: 'inherit'}}><td className="loading" colSpan="6"/></tr> : tfers && tfers.length? tfers : (<tr><td style={{textAlign: 'center'}} colSpan="7">No Tokens Transferred</td></tr>)}
        </tbody>
      </table>
    </div>
  )
}
