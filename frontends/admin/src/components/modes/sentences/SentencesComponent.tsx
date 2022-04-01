import React from 'react';
import { ReactTabulator } from 'react-tabulator'; 
//import 'react-tabulator/lib/css/tabulator.min.css'; // theme
import 'react-tabulator/lib/css/tabulator_simple.min.css'; // theme
import 'react-tabulator/lib/styles.css'; // required styles
import ApiConfig from '../../../ApiConfig';
import { SpeakRequest } from '../../../api/ApiDefinition'
import Howl from 'howler';
import { url } from 'inspector';

interface Props {
  apiConfig: ApiConfig,
}

interface State {
}

class SentencesComponent extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
  }

  public speak(sentence: String, speaker: String) {
    let request = new SpeakRequest(sentence, speaker);

    console.log("Making SpeakRequest:", request);

    const url = this.props.apiConfig.getEndpoint('/speak');

    fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })
    .then(res => res.blob())
    .then(blob => {
      console.log(blob);

      const url = window.URL.createObjectURL(blob);
      console.log(url);

      const sound = new Howl.Howl({
        src: [url],
        format: 'wav',
      });
      
      this.setState({howl: sound});
      sound.play();

      (window as any).sound = sound;
    });
  }

  public render() {
    const that = this;

    let columns = [
      { 
        title: "ID", 
        field: "id", 
        sorter: "number",
        width: 100 
      },
      { 
        title: "Sentence", 
        field: "sentence", 
        formatter: "textarea",
        minWidth: 400,
        variableHight: true,
      },
      { 
        title: "Speaker", 
        field: "speaker", 
        width: 100, 
        cellClick: function(e: any, cell: any) { 
          const row = cell.getRow();
          const sentence = row._row.data.sentence;
          const speaker = row._row.data.speaker.split(' ')[0]; // Remove emoji
          that.speak(sentence, speaker);
        },
        mutator: function(value: string, data: any) {
          const emoji = '🔊';
          return `${value} ${emoji}`;
        }
      },
      { 
        title: "IP Address", 
        field: "ip_address", 
        width: 100,
        mutator: function(value: string, data: any) {
          // Remove port from socket
          return value.split(":")[0];
        }
      },
      {
        title: "Created", 
        field: "created_at", 
        width: 150, 
        mutator: function(value: string, data: any) {
          //return value.split("T")[0];
          return value.replace('T', ' ');
        }
      },
    ];

    const sentencesEndpoint = this.props.apiConfig.getEndpoint('/sentences');

    let options = {
      ajaxURL: sentencesEndpoint,
      ajaxConfig: "GET",
      ajaxContentType: "json",
      //ajaxProgressiveLoad: 'load',
      ajaxSorting: true,
      pagination: 'remote',
      ajaxResponse: function(url: any, params: any, response: any) {
        //url - the URL of the request
        //params - the parameters passed with the request
        //response - the JSON object returned in the body of the response.
        return response;
      },
      ajaxURLGenerator: function(url: any, config: any, params: any){
        //url - the url from the ajaxURL property or setData function
        //config - the request config object from the ajaxConfig property
        //params - the params object from the ajaxParams property, this will also include any pagination, filter and sorting properties based on table setup

        // We only sort on the 'ID' field.
        let sortDirection = 'desc'; // Let's see most recent first.
        let sorter = params.sorters.find((sorter: any) => sorter.field == 'id');
        if (sorter !== undefined) {
          sortDirection = sorter.dir; // 'asc' or 'desc'
        }

        const page = params.page;
        const urlWithParams = `${url}?page=${page}&sort_direction=${sortDirection}&per_page=200`;
        return urlWithParams;
      },
    }

    let data : any = [];

    return (
      <div>
        <ReactTabulator columns={columns} data={data} options={options} />
      </div>
    );
  }
}

export {SentencesComponent};
