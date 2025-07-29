import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_API_URL;

class CampaignService {

    getAllCampaigns() {
        return axios.get(`${BASE_URL}/campaigns`);
    }
}
export default new CampaignService();