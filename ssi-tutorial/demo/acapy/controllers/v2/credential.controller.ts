import BaseAgent from './agent.base';
import { Request, Response } from 'express';
import { apiFetch } from '../../utils/network-call';
import { getIssuedCredential, issueCredential } from '../../api_v2';

export class CredentialController extends BaseAgent {
  static async issueCredential(req: Request, res: Response) {
    const { connectionId, username, email, occupation, citizenship } = req.body;

    if (!connectionId) {
      return res.status(400).send({ error: 'connectionId is required' });
    }
    if (!BaseAgent.credentialDefinitionId) {
      return res
        .status(400)
        .send({ error: 'credentialDefinitionId is required' });
    }
    const attributes = [
      {
        // 'mime-type': 'application/json',
        name: 'username',
        value: `${username ?? 'john_doe'}`
      },
      {
        // 'mime-type': 'application/json',
        name: 'email',
        value: `${email ?? 'test@test.com'}`
      },
      {
        // 'mime-type': 'application/json',
        name: 'occupation',
        value: `${occupation ?? 'Software Developer'}`
      },
      {
        // 'mime-type': 'application/json',
        name: 'citizenship',
        value: `${citizenship ?? 'USA'}`
      }
    ];
    if (!Array.isArray(attributes) || attributes.length === 0) {
      return res.status(400).send({
        error: 'attributes must be an array with at least one element',
      });
    }

    for (const attribute of attributes) {
      if (!attribute.name || !attribute.value) {
        return res
          .status(400)
          .send({ error: 'attributes must have a name and value' });
      }
    }
    try {
      console.log('issuing credential ....');
      // const result = await apiFetch(issueCredential, 'POST', {connection_id: connectionId, cred_def_id: BaseAgent.credentialDefinitionId, credential_proposal: { "@type" : "issue-credential/1.0/credential-preview", attributes}});
      const result = await apiFetch(issueCredential, 'POST', {
        connection_id: connectionId,
        credential_preview: {
          '@type': 'issue-credential/2.0/credential-preview',
          attributes
        },
        filter: {
          indy: {
            cred_def_id: BaseAgent.credentialDefinitionId
          }
        }
      });
      if (result) {
        res.status(200).send(result);
      } else {
        res.status(500).send({ error: 'issuing credential failed' });
      }
    } catch (error) {
      console.log("Error: ", JSON.stringify(error.message));
      res.status(500).send({ error: error.message });
    }
  }

  static async issuedCredential(req: Request, res: Response) {
    const { credentialId } = req.query;

    try {
      const result = await apiFetch(getIssuedCredential(credentialId), 'GET');
      if (result) {
        res.status(200).send(result);
      } else {
        res.status(500).send({ error: 'issuing credential failed' });
      }
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  }
}
