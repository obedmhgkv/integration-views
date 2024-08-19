export default class ClaimMapper {
  static async mapClaim(claim: any) {
    const customerMatch = claim.desc.match(/Customer: (.+)/);
    const customer = customerMatch ? customerMatch[1] : null;

    const descriptionMatch = claim.desc.match(/Description: (.+)/);
    const description = descriptionMatch ? descriptionMatch[1] : null;

    const mappedClaim: any = {
      id: claim.id,
      name: claim.name.split(' - ')[1],
      desc: description,
      claimNumber: claim.name.split(' ')[0],
      status: 'Open',
      accountId: customer,
      lastUpdated: this.formatDate(claim.dateLastActivity),
    };
    return mappedClaim;
  }

  static formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toDateString();
  }
}
