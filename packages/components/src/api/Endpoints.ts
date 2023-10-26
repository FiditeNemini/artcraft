import GetApiHost from "./GetApiHost";

interface StrObj {
  [key: string]: any;
}

const n = (x: any) => "";
const [ apiHost, disableSSL = false ] = GetApiHost();

const endpoints: { [key: string]: any } = {
	voice_designer: {
		create: () => `create`,
		update: ({ voiceToken = "" }) => `${ voiceToken }/update`,
		delete: ({ voiceToken = "" }) => `${ voiceToken }/delete`,
		list: ({ userToken = "" }) => `user/${ userToken }/list`,
	}
};

const getPath = (category = "", method = "") =>
	`${ disableSSL ? "http" : "https" }://${ apiHost }/${ ((endpoints[category] || {})[method] || n)() }`;

const consumeEndpoint = async(category = "", method = "", request = {}) => {
	return await fetch(getPath(category,method), {
		method: 'POST',
		headers: {
		      'Accept': 'application/json',
		      'Content-Type': 'application/json',
		},
	    credentials: 'include',
	    body: JSON.stringify(request),
	}).then(res => {
		console.log("response got",res);
		let resObj = res.json();
		if (resObj && "success" in res) {
			console.log("a good one");
			return res
		}	else {
			console.log("a bad one");
			throw new Error;
		}
	}).catch(e => {
		console.log("🚛");
		return { success: false };
	});
};

export default consumeEndpoint;