 await exiftool.write(filePath, { ...gpsData, ...descriptionData });
    const tags = await exiftool.read(filePath);

 const gpsData = {
    GPSLatitude: convertToDMS(metadata.latitude),
    GPSLongitude: convertToDMS(metadata.longitude),
    GPSLatitudeRef: metadata.latitude >= 0 ? 'N' : 'S',
    GPSLongitudeRef: metadata.longitude >= 0 ? 'E' : 'W',
    GPSAltitude: 0,
    GPSAltitudeRef: 0,
    GPSDateTime: new Date().toISOString(),
    GPSAreaInformation: `Gram Panchayat: ${metadata.gpName}\nAddress: ${metadata.address}\nSurpanch: ${metadata.surpanchName}\nContact: ${metadata.mobileNo}`,
    GPSCity: metadata.gpName,
    GPSCountry: 'India',
    GPSState: 'Haryana',
    GPSLocation: `${metadata.gpName} Gram Panchayat, ${metadata.address}`
  };
 const descriptionData = {
    ImageDescription: `Gram Panchayat Documentation: ${metadata.fieldName.replace(/_/g, ' ')}`,
    UserComment: [
      `Gram Panchayat: ${metadata.gpName}`,
      `Address: ${metadata.address}`,
      `Survey Date: ${metadata.surveyDate}`,
      `Surpanch: ${metadata.surpanchName}`,
      `Contact: ${metadata.mobileNo}`,
      `Coordinates: ${metadata.latitude}, ${metadata.longitude}`,
      `Documentation of: ${metadata.fieldName.replace(/_/g, ' ')}`
    ].join('\n'),
    Artist: 'Gram Panchayat Survey Team',
    Copyright: `Copyright ${new Date().getFullYear()} Gram Panchayat Records`,
    Keywords: [
      'Gram Panchayat',
      metadata.gpName,
      'Survey',
      'Documentation',
      metadata.fieldName.split('_')[0]
    ].filter(k => k),
    Rating: 5,
    DateTimeOriginal: metadata.surveyDate !== 'Unknown date' ? 
      new Date(metadata.surveyDate).toISOString() : 
      new Date().toISOString()
  };
  