export default interface IDriverAccount {
    token: string;
    deviceIdentifier: string;
    company: {
        id: string | number;
    };
}
