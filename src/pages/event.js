import React, { useEffect, useMemo, useState } from 'react';
import { usePagination, useSortBy, useTable } from 'react-table';
import { InView } from 'react-intersection-observer';
import ReactTooltip from 'react-tooltip';
import {
  Route,
  Switch,
  useParams,
  useRouteMatch,
  Link,
} from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAngleLeft,
  faAngleRight,
  faArrowDown,
  faArrowUp,
  faDotCircle,
  faQuestionCircle,
} from '@fortawesome/free-solid-svg-icons';
import { Helmet } from 'react-helmet';
import { useDispatch, useSelector } from 'react-redux';
import { FETCH_EVENT_PAGE_INFO_STATUS, fetchEventPageData } from '../store';
import { CSVLink } from 'react-csv';
import { getEnsData } from '../store/mutations';
import { Loader } from '../components/loader';
import _ from 'lodash';
import { EventCard } from '../components/eventCard';
import { Foliage } from '../components/foliage';
import {
  dateCell,
  shrinkAddress,
  utcDateFormatted,
  utcDateFull,
} from '../utilities/utilities';
import { useWindowWidth } from '@react-hook/window-size/throttled';
import { Spinner } from '../components/spinner';
import { collectionlLinks, externalLinkSetter } from '../utilities/utilities';
import { POAP_APP_URL } from '../store/api';
import { useMatomo } from '@datapunt/matomo-tracker-react';

const FETCH_POAPS_LIMIT = 300;
const CSV_STATUS = {
  DownloadingData: 'DownloadingData',
  DownloadingLastDataChunk: 'DownloadingLastDataChunk',
  ReadyWithoutEns: 'ReadyWithoutEns',
  Ready: 'Ready',
  Failed: 'Failed',
  NoTokens: 'NoTokens',
};

const POAP_FAMILY_URL =
  process.env.REACT_APP_POAP_FAMILY_URL ?? 'https://poap.family';

export default function Events() {
  let match = useRouteMatch();

  return (
    <Switch>
      <Route path={`${match.path}/:eventId`}>
        <Event />
      </Route>
      <Route path={match.path}>
        <h3 className={'center'}>No event Selected</h3>
      </Route>
    </Switch>
  );
}

export function Event() {
  const params = useParams();
  const { eventId } = params;
  const dispatch = useDispatch();
  const { trackPageView, trackLink } = useMatomo();

  const tokens = useSelector((state) => state.events.tokens);
  const loadingEvent = useSelector((state) => state.events.eventStatus);
  const errorEvent = useSelector((state) => state.events.eventError);
  const event = useSelector((state) => state.events.event);

  const [pageIndex, setPageIndex] = useState(0);
  const [csv_data, setCsv_data] = useState([]);
  const [ensNames, setEnsNames] = useState([]);
  const [canDownloadCsv, setCanDownloadCsv] = useState(CSV_STATUS.NoTokens);
  const [tableIsLoading, setTableIsLoading] = useState(true);
  const [trackedEvent, setTrackedEvent] = useState(null);
  const pageCount = useMemo(
    () =>
      event.tokenCount % 50 !== 0
        ? Math.floor(event.tokenCount / 50) + 1
        : event.tokenCount,
    [event]
  );
  const power = calculatePower(csv_data);

  const csvDownloading = () =>
    canDownloadCsv === CSV_STATUS.DownloadingLastDataChunk ||
    canDownloadCsv === CSV_STATUS.DownloadingData;
  const csvReady = () => canDownloadCsv === CSV_STATUS.Ready;
  const csvOnlyMissingEns = () => canDownloadCsv === CSV_STATUS.ReadyWithoutEns;
  const csvFailed = () => canDownloadCsv === CSV_STATUS.Failed;

  const readyToResolveENS = () =>
    canDownloadCsv === CSV_STATUS.DownloadingLastDataChunk ||
    canDownloadCsv === CSV_STATUS.ReadyWithoutEns ||
    canDownloadCsv === CSV_STATUS.Ready ||
    canDownloadCsv === CSV_STATUS.Failed;

  const succeededLoadingEvent = () =>
    loadingEvent === FETCH_EVENT_PAGE_INFO_STATUS.SUCCEEDED;
  const isLoadingEvent = () =>
    loadingEvent === FETCH_EVENT_PAGE_INFO_STATUS.LOADING;
  const failedLoadingEvent = () =>
    loadingEvent === FETCH_EVENT_PAGE_INFO_STATUS.FAILED;
  const isIdle = () =>
    loadingEvent === FETCH_EVENT_PAGE_INFO_STATUS.IDLE ||
    loadingEvent === undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (
      succeededLoadingEvent() &&
      event &&
      event?.name &&
      event?.id &&
      (!trackedEvent || trackedEvent !== event.id)
    ) {
      trackPageView({
        href: window.location.href,
        documentTitle: `POAP Gallery - Event - ${event.name}`,
      });
      setTrackedEvent(event.id);
    }
  }, [event, succeededLoadingEvent, trackedEvent, setTrackedEvent]);

  useEffect(() => {
    // Get new batch of tokens
    if (eventId) {
      dispatch(
        fetchEventPageData({
          eventId,
          first: FETCH_POAPS_LIMIT,
          skip: FETCH_POAPS_LIMIT * pageIndex,
        })
      );
    }
  }, [dispatch, eventId, pageIndex]);

  useEffect(() => {
    // Call next batch of tokens (if there is more), then load the new tokens data
    const totalPages = Math.ceil(event.tokenCount / FETCH_POAPS_LIMIT);
    const hasMorePages = pageIndex < totalPages;
    const hasTokens = tokens && tokens.length > 0;
    if (event && hasTokens && hasMorePages) {
      if (pageIndex + 1 === totalPages) {
        setCanDownloadCsv(CSV_STATUS.DownloadingLastDataChunk);
      } else {
        setCanDownloadCsv(CSV_STATUS.DownloadingData);
      }
      setPageIndex(pageIndex + 1);
    }

    let _csv_data = [];
    _csv_data.push([
      'ID',
      'Collection',
      'ENS',
      'Minting Date',
      'Tx Count',
      'Power',
    ]);
    for (let i = 0; i < tokens.length; i++) {
      _csv_data.push([
        tokens[i].id,
        tokens[i].owner.id,
        null,
        utcDateFull(tokens[i].created),
        tokens[i].transferCount,
        tokens[i].owner.tokensOwned,
      ]);
    }
    setCsv_data(_csv_data);
  }, [event, tokens, pageIndex, setPageIndex]);

  useEffect(() => {
    // Merge ens data
    if (ensNames.length > 0) {
      // TODO: probably there is a better way to merge
      let _csv_data = _.cloneDeep(csv_data);
      for (let i = 0; i < tokens.length; i++) {
        let validName = ensNames[i];
        if (validName) {
          if (_csv_data[i + 1]) {
            _csv_data[i + 1][2] = validName; // i+1 is there to compensate for the first array which is just the csv titles
          }
        }
      }
      setCsv_data(_csv_data);
    }
  }, [ensNames]);

  const validationCSVDownload = async () => {
    setCanDownloadCsv(CSV_STATUS.ReadyWithoutEns);
    let ownerIds = tokens.map((t) => t.owner.id);
    try {
      const ensData = await getEnsData(ownerIds);
      if (ensData.length > 0) {
        setEnsNames(ensData);
        setCanDownloadCsv(CSV_STATUS.Ready);
      } else {
        setCanDownloadCsv(CSV_STATUS.Failed);
      }
    } catch (e) {
      setCanDownloadCsv(CSV_STATUS.Failed);
    }
  };

  useEffect(() => {
    if (succeededLoadingEvent() && readyToResolveENS()) {
      validationCSVDownload();
    }
    setTableIsLoading(!succeededLoadingEvent());
  }, [tokens]);

  const defaultEventErrorMessage = 'Token not found';

  const previousEventURI = `/event/${parseInt(eventId) - 1}`;
  const nextEventURI = `/event/${parseInt(eventId) + 1}`;

  const resetState = () => {
    setTableIsLoading(true);
    setCanDownloadCsv(CSV_STATUS.NoTokens);
    setPageIndex(0);
    setEnsNames([]);
  };
  const onPageChangeHandler = () => {
    resetState();
  };

  return (
    <main id="site-main" role="main" className="app-content event-main">
      <Helmet>
        <title>POAP Gallery - Event</title>
        <link rel="canonical" href={'https://poap.gallery/event/' + eventId} />
        <meta
          property="og:url"
          content={'https://poap.gallery/event/' + eventId}
        />
        <meta property="og:title" content="POAP Gallery - Event" />
      </Helmet>
      <Foliage />
      {(isLoadingEvent() || isIdle()) && (
        <div className={'center'}>
          <Loader />
        </div>
      )}
      {failedLoadingEvent() && (
        <div className={'token-not-found'}>
          <h2>{errorEvent || defaultEventErrorMessage}</h2>
          <div>
            <img
              alt="warning sign"
              style={{ maxWidth: '30rem' }}
              src="/icons/warning.svg"
            />
          </div>
        </div>
      )}
      {succeededLoadingEvent() && (
        <div className="container">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              alignContent: 'space-around',
              justifyContent: 'space-around',
              marginBottom: 82,
            }}
          >
            <div
              style={{
                flex: '0 0 18rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <div
                className="prev-next-buttons"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 38,
                }}
              >
                <Link onClick={onPageChangeHandler} to={previousEventURI}>
                  <FontAwesomeIcon icon={faAngleLeft} />
                  {'  Prev'}
                </Link>
                <h4 style={{ marginBottom: '0' }}>
                  <div className="event-title">EVENT ID</div>
                  <div className="event-id">#{eventId}</div>
                </h4>
                <Link onClick={onPageChangeHandler} to={nextEventURI}>
                  {'Next  '}
                  <FontAwesomeIcon icon={faAngleRight} />
                </Link>
              </div>
              <div style={{ minHeight: '200px', margin: '0 auto' }}>
                <EventCard key={0} event={event} size="l" power={power} />
              </div>
              <div
                className="more-info"
                style={{
                  padding: '1rem',
                  textAlign: 'center',
                }}
              >
                Find more interesting information about this drop in{' '}
                <a
                  href={`${POAP_FAMILY_URL}/event/${eventId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  POAP.family
                </a>
                !
              </div>
            </div>
          </div>
          <div className="table-header">
            <div className="table-title">
              Collections <span>({tokens.length})</span>
            </div>
            {(csvReady() || csvOnlyMissingEns() || csvFailed()) && (
              <CSVLink
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.pathname += `/${event.name}.csv`;
                  trackLink({
                    href: url,
                    linkType: 'download',
                  });
                }}
                filename={`${event.name}.csv`}
                target="_blank"
                data-tip={`${
                  csvOnlyMissingEns()
                    ? 'Please wait if you want the ens names too'
                    : csvFailed()
                    ? "Ens names couldn't be fetched"
                    : ''
                }`}
                className={'btn csv-button'}
                data={csv_data}
              >
                <span className={'no-margin'}>{`Download CSV${
                  csvOnlyMissingEns() || csvFailed() ? ' (without ENS)' : ''
                }`}</span>
                <ReactTooltip effect={'solid'} />
              </CSVLink>
            )}
            {csvDownloading() && (
              <button
                className={'btn button-disabled csv-button'}
                data-tip={'Please wait for the POAPs data to be loaded'}
                onClick={null}
              >
                <Spinner padding={0} imgWidth={25} />
                <ReactTooltip effect={'solid'} />
              </button>
            )}
          </div>
          <div className="table-container">
            <TableContainer
              tokens={tokens}
              ensNames={ensNames}
              loading={tableIsLoading}
              pageCount={pageCount}
            />
          </div>
        </div>
      )}
    </main>
  );
}

const handleIconClick = (e) => {
  if (e.currentTarget) {
    e.currentTarget.blur();
  }
};

const ExternalIconCell = ({ url, icon, tooltipText = null }) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={tooltipText}
      data-cooltipz-dir="top"
      style={{ position: 'relative', width: 27 }}
      onClick={handleIconClick}
      onContextMenu={handleIconClick}
    >
      <span>{icon}</span>
    </a>
  );
};

const ExternalLinkCell = ({ url, tooltipText = null, content }) => {
  const width = useWindowWidth();

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={tooltipText}
      data-cooltipz-dir="top"
      style={{ position: 'relative', width: 27 }}
      onClick={handleIconClick}
      onContextMenu={handleIconClick}
    >
      <span>{shrinkAddress(content, width > 768 ? 20 : 10)}</span>
    </a>
  );
};

function TableContainer({ tokens, ensNames, pageCount: pc, loading }) {
  const [data, setData] = useState([]);
  const [mobileData, setMobileData] = useState([]);

  const PoapScanLink = (token) => {
    return `${POAP_APP_URL}/scan/${token.owner.id}`;
  };

  const MobileRow = ({ token, address }) => (
    <div className={'mobile-row open'}>
      <span className="id-title">POAP ID</span>
      <span className="id-content">#{token.id}</span>
      <span className="address-title">Address</span>
      <span className="address-content ellipsis">
        <a href={PoapScanLink(token)} target="_blank" rel="noopener noreferrer">
          {shrinkAddress(address, 15)}
        </a>
      </span>
      <span className="claim-title">Minting Date</span>
      <span className="claim-content">{utcDateFormatted(token.created)}</span>
      <span className="tr-count-title">Transaction Count</span>
      <span className="tr-count-content">{token.transferCount}</span>
      <span className="power-title">Power</span>
      <span className="power-content">{token.owner.tokensOwned}</span>
    </div>
  );

  const columns = useMemo(
    () => [
      {
        Header: () => (
          <>
            <span data-tip="Click to sort by ID">POAP ID </span>
            <ReactTooltip effect="solid" />
          </>
        ),
        accessor: 'col1', // accessor is the "key" in the data
      },
      {
        Header: 'Collection',
        accessor: 'col2',
      },
      {
        Header: 'Minting Date',
        accessor: 'col3',
      },
      {
        Header: (
          <>
            <span data-tip="Click to sort by TX Count">TX Count </span>
            <ReactTooltip effect="solid" />
          </>
        ),
        accessor: 'col4',
      },
      {
        Header: () => (
          <>
            <span>
              <span data-tip="Click to sort by Power" data-for="power-order">
                Power
              </span>{' '}
              <FontAwesomeIcon
                icon={faQuestionCircle}
                data-tip="Total amount of POAPs held by this address"
                data-for="power-info"
              />
              <ReactTooltip id="power-info" effect="solid" />{' '}
            </span>
            <ReactTooltip id="power-order" effect="solid" />
          </>
        ),
        accessor: 'col5',
      },
    ],
    []
  );

  const mobileColumns = useMemo(
    () => [
      {
        Header: '',
        accessor: 'col1', // accessor is the "key" in the data
      },
    ],
    []
  );

  useEffect(() => {
    let _data = [],
      _mobileData = [];
    for (let i = 0; i < tokens.length; i++) {
      _data.push({
        col1: (
          <ExternalLinkCell
            url={`${POAP_APP_URL}/token/${tokens[i].id}`}
            content={`#${tokens[i].id}`}
          />
        ),
        col2: (
          <div>
            <ExternalLinkCell
              url={PoapScanLink(tokens[i])}
              tooltipText="View Collection in POAP.scan"
              content={tokens[i].owner.id}
            />
            {collectionlLinks.map((link) => (
              <ExternalIconCell
                url={externalLinkSetter(tokens[i].owner.id, link.id)}
                key={link.id}
                icon={link.icon}
                tooltipText={link.tooltipText}
              />
            ))}
          </div>
        ),
        col3: tokens[i].created,
        col4: tokens[i].transferCount,
        col5: tokens[i].owner.tokensOwned,
      });
      _mobileData.push({
        col1: <MobileRow token={tokens[i]} address={tokens[i].owner.id} />,
      });
    }
    setData(_data);
    setMobileData(_mobileData);
  }, [tokens]);

  useEffect(() => {
    // Merge ens data
    if (ensNames.length > 0) {
      // TODO: probably there is a better way to merge
      let _data = _.cloneDeep(data);
      let _mobileData = _.cloneDeep(mobileData);
      for (let i = 0; i < tokens.length; i++) {
        let validName = ensNames[i];
        if (validName) {
          if (data[i]) {
            _data[i].col2 = (
              <div>
                <a
                  href={PoapScanLink(tokens[i])}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-tip="View Collection in POAP.scan"
                >
                  {' '}
                  <ReactTooltip effect="solid" /> {validName}
                </a>
                {collectionlLinks.map((link) => (
                  <ExternalIconCell
                    url={externalLinkSetter(tokens[i].owner.id, link.id)}
                    key={link.id}
                    icon={link.icon}
                    tooltipText={link.tooltipText}
                  />
                ))}
              </div>
            );
            _mobileData[i].col1 = (
              <MobileRow token={tokens[i]} address={validName} />
            );
          }
        }
      }
      setData(_data);
      setMobileData(_mobileData);
    }
  }, [ensNames]);

  const [dateFormat, setDateFormat] = useState('timeago');
  const toggleDateFormat = () => {
    dateFormat === 'timeago' ? setDateFormat('date') : setDateFormat('timeago');
  };

  const width = useWindowWidth();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const _isMobile = width <= 480;
    if (_isMobile !== isMobile) {
      setIsMobile(_isMobile);
    }
  }, [width]);

  const [length, setLength] = useState(20);
  const {
    getTableProps: getDesktopTableProps,
    getTableBodyProps: getDesktopTableBodyProps,
    headerGroups: desktopHeaderGroups,
    prepareRow: desktopPrepareRow,
    page: desktopPage,
    setPageSize: setDesktopPageSize,
  } = useTable(
    {
      columns,
      data,
      pageCount: pc,
      initialState: {
        pageSize: length,
        sortBy: [
          {
            id: 'col3',
            desc: true,
          },
        ],
      },
    },
    useSortBy,
    usePagination
  );

  const {
    getTableProps: getMobileTableProps,
    getTableBodyProps: getMobileTableBodyProps,
    headerGroups: mobileHeaderGroups,
    prepareRow: mobilePrepareRow,
    page: mobilePage,
    setPageSize: setMobilePageSize,
  } = useTable(
    {
      columns: mobileColumns,
      data: mobileData,
      pageCount: pc,
      initialState: { pageSize: length },
    },
    useSortBy,
    usePagination
  );

  return (
    <div style={{ width: '100%' }} className="event-table">
      <table
        style={{ width: '100%' }}
        {...(isMobile ? getMobileTableProps : getDesktopTableProps)()}
      >
        <thead>
          {
            // Loop over the header rows
            (isMobile ? mobileHeaderGroups : desktopHeaderGroups).map(
              (headerGroup, i) => (
                // Apply the header row props
                <tr key={i} {...headerGroup.getHeaderGroupProps()}>
                  {
                    // Loop over the headers in each row
                    headerGroup.headers.map((column, idx) => {
                      // Apply the header cell props
                      if (isMobile) {
                        return (
                          <th key={idx} {...column.getHeaderProps()}>
                            {
                              // Render the header
                              column.render('Header')
                            }
                          </th>
                        );
                      } else {
                        switch (idx) {
                          case 0:
                          case 3:
                          case 4:
                            return (
                              <th
                                key={idx}
                                {...column.getHeaderProps(
                                  column.getSortByToggleProps({
                                    title: undefined,
                                  })
                                )}
                              >
                                {
                                  // Render the header
                                  column.render('Header')
                                }{' '}
                                {column.isSorted ? (
                                  column.isSortedDesc ? (
                                    <FontAwesomeIcon
                                      style={{
                                        width: '1rem',
                                        marginRight: '.2rem',
                                      }}
                                      icon={faArrowDown}
                                    />
                                  ) : (
                                    <FontAwesomeIcon
                                      style={{
                                        width: '1rem',
                                        marginRight: '.2rem',
                                      }}
                                      icon={faArrowUp}
                                    />
                                  )
                                ) : (
                                  ''
                                )}
                              </th>
                            );
                          case 2:
                            return (
                              <th key={idx} {...column.getHeaderProps()}>
                                {
                                  // Render the header
                                  column.render('Header')
                                }{' '}
                                <FontAwesomeIcon
                                  onClick={toggleDateFormat}
                                  style={{
                                    width: '1rem',
                                    marginRight: '.2rem',
                                    cursor: 'pointer',
                                  }}
                                  icon={faDotCircle}
                                  data-tip="Toggle date format"
                                />{' '}
                                <ReactTooltip effect="solid" />
                              </th>
                            );
                          default:
                            return (
                              <th key={idx} {...column.getHeaderProps()}>
                                {
                                  // Render the header
                                  column.render('Header')
                                }
                              </th>
                            );
                        }
                      }
                    })
                  }
                </tr>
              )
            )
          }
        </thead>
        {/* Apply the table body props */}
        <tbody
          {...(isMobile ? getMobileTableBodyProps : getDesktopTableBodyProps)()}
        >
          {(isMobile ? mobilePage : desktopPage).map((row, i) => {
            (isMobile ? mobilePrepareRow : desktopPrepareRow)(row);
            if (isMobile) {
              return (
                <tr key={i} {...row.getRowProps()}>
                  {row.cells.map((cell, idx) => {
                    return (
                      <td key={idx} {...cell.getCellProps()}>
                        {cell.render('Cell')}
                      </td>
                    );
                  })}
                </tr>
              );
            } else {
              return (
                <tr key={i} {...row.getRowProps()}>
                  {row.cells.map((cell, idx) => {
                    return idx === 2 ? (
                      <td key={idx} {...cell.getCellProps()}>
                        {dateCell(cell.value, dateFormat)}
                      </td>
                    ) : (
                      <td key={idx} {...cell.getCellProps()}>
                        {cell.render('Cell')}
                      </td>
                    );
                  })}
                </tr>
              );
            }
          })}
          <tr>
            {loading ? (
              // Use our custom loading state to show a loading indicator
              <td colSpan="10000">Loading...</td>
            ) : (
              <td colSpan="10000" />
            )}
          </tr>
        </tbody>
      </table>
      <div className="pagination">
        <InView
          threshold={1}
          onChange={(inView) => {
            if (inView) {
              (isMobile ? setMobilePageSize : setDesktopPageSize)(length + 20);
              setLength(length + 20);
            }
          }}
        >
          {({ ref }) => <div ref={ref} />}
        </InView>
      </div>
    </div>
  );
}

function calculatePower(csv_data) {
  if (!Array.isArray(csv_data) || csv_data.length <= 1) {
    return 0;
  }
  const power = csv_data.reduce((power, token, index) => {
    if (index === 0) return 0;
    return power + token[5];
  }, 0);
  return power;
}
