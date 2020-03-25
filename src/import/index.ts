import { Oparl } from 'oparl-sdk';
import { Organization } from 'oparl-sdk/dist/types';
import {
  PrismaClient,
  OrganizationCreateInput,
  OrganizationUpdateInput,
} from '@prisma/client';

const oparl = new Oparl({
  entrypoint:
    'https://sdnetrim.kdvz-frechen.de/rim4883/webservice/oparl/v1.1/body/1',
  limit: {
    maxRequests: 5,
    perMilliseconds: 1000,
  },
});

export const startImport = async () => {
  const prisma = new PrismaClient();
  let organizationList = await oparl.getOrganizations();
  if (organizationList) {
    let hasNext = true;
    do {
      // const organizations = organizationList.data.map(organization => {
      const organization = organizationList.data[0];
      console.log('import orga');
      console.log(organization.post);
      const organizationPrepared = {
        ...organization,
        body: undefined,
        'STERNBERG:gruppierung': undefined,
        'STERNBERG:sortierung': undefined,
        membership: undefined,
        meeting: undefined,
        location: undefined,
        keyword: undefined,
        subOrganizationOf: undefined,
        post: {
          set: organization.post,
        },
      };
      return prisma.organization
        .upsert({
          create: organizationPrepared,
          update: organizationPrepared,
          where: { id: organizationPrepared.id },
        })
        .catch(console.log);
      // });
      if (organizationList?.next && false) {
        organizationList = await organizationList.next();
      } else {
        hasNext = false;
      }
    } while (hasNext);
    console.log('### IMPORT DONE ###');
  }
};
