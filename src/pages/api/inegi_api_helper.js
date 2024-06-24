export async function GetTotalPopulation() {
  try {
    const request = await fetch(
      "https://www.inegi.org.mx/app/api/indicadores/desarrolladores/jsonxml/INDICATOR/1002000001/es/0700/true/BISE/2.0/047d79c3-dbaf-bb11-f7f9-3cc928ad5416?type=json",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (request.status === 200) {
      const data = await request.json();
      console.log(data);
      return data.Series[0].OBSERVATIONS[0].OBS_VALUE;
    }
  } catch (error) {
    console.log("There was an error accessing the INEGI API", error);
  }
}

export async function GetTotalPopulationByState(_state_id) {
  try {
    const request = await fetch(
      "https://www.inegi.org.mx/app/api/indicadores/desarrolladores/jsonxml/INDICATOR/1002000001/es/070000" +
        _state_id +
        "/true/BISE/2.0/047d79c3-dbaf-bb11-f7f9-3cc928ad5416?type=json",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (request.status === 200) {
      const data = await request.json();
      console.log(data);
      return data.Series[0].OBSERVATIONS[0].OBS_VALUE;
    }
  } catch (error) {
    console.log("There was an error accessing the INEGI API", error);
  }
}
