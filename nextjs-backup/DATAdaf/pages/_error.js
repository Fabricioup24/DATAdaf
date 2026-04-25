function Error({ statusCode }) {
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#121212',
      color: '#ffffff',
      fontFamily: 'Manrope, sans-serif'
    }}>
      <h1 style={{ fontSize: '4rem', margin: 0 }}>
        {statusCode ? statusCode : 'Error'}
      </h1>
      <p style={{ fontSize: '1.5rem', marginTop: '1rem' }}>
        {statusCode
          ? `An error ${statusCode} occurred on server`
          : 'An error occurred on client'}
      </p>
    </div>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
