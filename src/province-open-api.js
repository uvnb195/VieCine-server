require('dotenv').config()
const fetch = require('node-fetch');

class Province {
    url = process.env.PROVINCE_URL
    options = (header) => ({
        method: 'GET',
        headers: {
            accept: 'application/json',
            ...header
        }
    })

    filterData = (data) => {
        if (!data && data.length == 0) return []
        return data.map(item => ({
            name: item.name,
            code: item.code
        }))
    }

    async getAllProvince() {
        const url = `${this.url}/province`
        try {
            const response = await fetch(
                url,
                this.options({
                    'token': process.env.GHN_TOKEN,
                }))
                .then(res => res.json())
                .then(res => {
                    const data = res.data
                    return data.map(item => ({
                        name: item.ProvinceName,
                        code: item.ProvinceID
                    }))
                })
            return this.filterData(response)
        } catch (error) {
            throw error
        }
    }
    async getDistricts(provinceCode) {
        const url = `${this.url}/district?province_id=${provinceCode}`
        try {
            const response = await fetch(
                url,
                this.options({
                    'token': process.env.GHN_TOKEN,
                }))
                .then(res => res.json())
                .then(res => {
                    console.log(res, provinceCode)
                    const data = res.data.map(item => ({
                        name: item.DistrictName,
                        code: item.DistrictID
                    }))
                    console.log(data)
                    return data
                })
            return response
        } catch (err) {
            throw err
        }
    }
    async getWards(districtCode) {
        const url = `${this.url}/ward?district_id=${districtCode}`
        try {
            const response = await fetch(
                url,
                this.options({
                    'token': process.env.GHN_TOKEN,
                }))
                .then(res => res.json())
                .then(res => {
                    const data = res.data.map(item => ({
                        name: item.WardName,
                        code: item.WardCode
                    }))
                    console.log(data.length)
                    return data
                })
            return response
        } catch (err) {
            throw err
        }
    }
}

module.exports = new Province()
