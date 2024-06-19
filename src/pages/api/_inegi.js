export async function GetTotalPopulation() {
  try {
    let status;
    const request = await fetch(
      "https://www.inegi.org.mx/app/api/indicadores/desarrolladores/jsonxml/INDICATOR/1002000001/es/0700/true/BISE/2.0/047d79c3-dbaf-bb11-f7f9-3cc928ad5416?type=json",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    )
      .then((response) => response.json())
      .then((response) => console.log(JSON.stringify(response)))
      .then(() => (status = request.status));

    console.log(request.response);

    if (status == 200) {
      const obj = JSON.parse(request.response.json());
      return obj.Series.OBSERVATIONS.OBS_VALUE;
    }
  } catch (error) {
    console.log("There was an error accessing the INEGI API", error);
  }
}
