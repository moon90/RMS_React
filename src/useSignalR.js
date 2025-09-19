import React, { useState, useEffect } from 'react';
import * as signalR from '@microsoft/signalr';

const useSignalR = (hubUrl) => {
  const [connection, setConnection] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, [hubUrl]);

  useEffect(() => {
    if (connection) {
      connection.start()
        .then(() => {
          setIsConnected(true);
          setError(null);
          console.log('SignalR Connected!');
        })
        .catch(e => {
          setError(e);
          setIsConnected(false);
          console.error('SignalR Connection Error: ', e);
        });

      // Clean up connection on unmount
      return () => {
        connection.stop()
          .then(() => {
            setIsConnected(false);
            console.log('SignalR Disconnected!');
          })
          .catch(e => console.error('SignalR Disconnection Error: ', e));
      };
    }
  }, [connection]);

  return { connection, isConnected, error };
};

export default useSignalR;
