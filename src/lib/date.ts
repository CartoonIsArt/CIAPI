const getAfter2weeks = () => {
  const after2weeks = new Date()
  after2weeks.setTime(Date.now() + (14*24*60*60*1000))
  return after2weeks
}

export const cookieExpirationDate = () => getAfter2weeks()