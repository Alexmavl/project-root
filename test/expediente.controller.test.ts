/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';

import {
  listarExpedientes,
  obtenerExpedientePorCodigo,
  crearExpediente,
  // versiones SOLO por código:
  actualizarExpedientePorCodigo,
  cambiarEstadoPorCodigo,
  activarDesactivarPorCodigo,
} from '../src/controllers/expediente.controller';

// Mock de la DB
jest.mock('../src/db/db', () => ({ ejecutarSP: jest.fn() }));
import { ejecutarSP } from '../src/db/db';

function mockReqRes(overridesReq: Partial<Request> = {}) {
  const req = {
    params: {},
    query: {},
    body: {},
    user: { id: '00000000-0000-0000-0000-000000000001' },
    ...overridesReq,
  } as unknown as Request;

  const resJson = jest.fn();
  const resStatus = jest.fn().mockReturnThis();

  const res = { status: resStatus, json: resJson } as unknown as Response;
  return { req, res, resJson, resStatus };
}

beforeEach(() => jest.clearAllMocks());

describe('Expedientes (solo por código)', () => {
  describe('listarExpedientes', () => {
    it('200 lista paginada', async () => {
      (ejecutarSP as jest.Mock).mockResolvedValue([
        { codigo: 'EXP-001', total: 2 },
        { codigo: 'EXP-002', total: 2 },
      ]);

      const { req, res, resJson } = mockReqRes({
        query: { q: '', page: '1', pageSize: '10', estado: 'pendiente', activo: 'true' },
      });

      await listarExpedientes(req, res);

      expect(ejecutarSP).toHaveBeenCalledWith('sp_Expedientes_Listar', {
        q: '',
        page: 1,
        pageSize: 10,
        estado: 'pendiente',
        activo: 1,
      });
      expect(resJson).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        total: 2,
        data: [
          { codigo: 'EXP-001', total: 2 },
          { codigo: 'EXP-002', total: 2 },
        ],
      });
    });
  });

  describe('obtenerExpedientePorCodigo', () => {
    it('200 cuando existe', async () => {
      (ejecutarSP as jest.Mock).mockResolvedValue([{ codigo: 'EXP-004' }]);

      const { req, res, resJson } = mockReqRes({ params: { codigo: 'EXP-004' } });

      await obtenerExpedientePorCodigo(req, res);

      expect(ejecutarSP).toHaveBeenCalledWith('dbo.sp_Expedientes_ObtenerPorCodigo', {
        codigo: 'EXP-004',
      });
      expect(resJson).toHaveBeenCalledWith({ codigo: 'EXP-004' });
    });

    it('404 cuando no existe', async () => {
      (ejecutarSP as jest.Mock).mockResolvedValue([]);

      const { req, res, resStatus, resJson } = mockReqRes({ params: { codigo: 'NO-EXISTE' } });

      await obtenerExpedientePorCodigo(req, res);

      expect(resStatus).toHaveBeenCalledWith(404);
      expect(resJson).toHaveBeenCalledWith({ message: 'Expediente no encontrado' });
    });

    it('400 cuando falta código', async () => {
      const { req, res, resStatus, resJson } = mockReqRes({ params: { codigo: '' as any } });

      await obtenerExpedientePorCodigo(req, res);

      expect(resStatus).toHaveBeenCalledWith(400);
      expect(resJson).toHaveBeenCalledWith({ message: 'El código es requerido' });
    });
  });

  describe('crearExpediente', () => {
    it('201 cuando crea', async () => {
      (ejecutarSP as jest.Mock).mockResolvedValue([{ codigo: 'EXP-010', descripcion: 'Prueba' }]);

      const { req, res, resStatus, resJson } = mockReqRes({
        body: { codigo: 'EXP-010', descripcion: 'Prueba' },
      });

      await crearExpediente(req, res);

      expect(ejecutarSP).toHaveBeenCalledWith('sp_Expedientes_Crear', {
        codigo: 'EXP-010',
        descripcion: 'Prueba',
        tecnico_id: '00000000-0000-0000-0000-000000000001',
      });
      expect(resStatus).toHaveBeenCalledWith(201);
      expect(resJson).toHaveBeenCalledWith({ codigo: 'EXP-010', descripcion: 'Prueba' });
    });

    it('409 si el código ya existe', async () => {
      (ejecutarSP as jest.Mock).mockRejectedValue(new Error('CODIGO_DUPLICADO'));

      const { req, res, resStatus, resJson } = mockReqRes({
        body: { codigo: 'EXP-001', descripcion: 'Dup' },
      });

      await crearExpediente(req, res);

      expect(resStatus).toHaveBeenCalledWith(409);
      expect(resJson).toHaveBeenCalledWith({ message: 'El código ya existe' });
    });

    it('400 si falta codigo/descripcion', async () => {
      const { req, res, resStatus, resJson } = mockReqRes({
        body: { codigo: '', descripcion: '' },
      });

      await crearExpediente(req, res);

      expect(resStatus).toHaveBeenCalledWith(400);
      expect(resJson).toHaveBeenCalledWith({ message: 'codigo requerido' });
    });
  });

  describe('actualizarExpedientePorCodigo', () => {
    it('200 cuando actualiza por código', async () => {
      (ejecutarSP as jest.Mock).mockResolvedValue([{ codigo: 'EXP-004', descripcion: 'Act' }]);

      const { req, res, resJson } = mockReqRes({
        params: { codigo: 'EXP-004' },
        body: { codigo: 'EXP-004', descripcion: 'Act' },
      });

      await actualizarExpedientePorCodigo(req, res);

      // AQUI el cambio: tu controlador llama a dbo.sp_Expedientes_Actualizar y envía codigo_lookup
      expect(ejecutarSP).toHaveBeenCalledWith('dbo.sp_Expedientes_Actualizar', {
        codigo_lookup: 'EXP-004',
        codigo: 'EXP-004',
        descripcion: 'Act',
        tecnico_id: '00000000-0000-0000-0000-000000000001',
      });
      expect(resJson).toHaveBeenCalledWith({ codigo: 'EXP-004', descripcion: 'Act' });
    });

    it('409 cuando el código queda duplicado', async () => {
      (ejecutarSP as jest.Mock).mockRejectedValue(new Error('CODIGO_DUPLICADO'));

      const { req, res, resStatus, resJson } = mockReqRes({
        params: { codigo: 'EXP-004' },
        body: { codigo: 'EXP-004', descripcion: 'X' },
      });

      await actualizarExpedientePorCodigo(req, res);

      expect(resStatus).toHaveBeenCalledWith(409);
      expect(resJson).toHaveBeenCalledWith({ message: 'El código ya existe' });
    });
  });

  describe('cambiarEstadoPorCodigo', () => {
    it('200 cuando aprueba por código', async () => {
      (ejecutarSP as jest.Mock).mockResolvedValue([{ codigo: 'EXP-004', estado: 'aprobado' }]);

      const { req, res, resJson } = mockReqRes({
        params: { codigo: 'EXP-004' },
        body: { estado: 'aprobado' },
      });

      await cambiarEstadoPorCodigo(req, res);

      expect(ejecutarSP).toHaveBeenCalledWith('sp_Expedientes_CambiarEstado', {
        codigo: 'EXP-004',
        estado: 'aprobado',
        justificacion: undefined,
        aprobador_id: '00000000-0000-0000-0000-000000000001',
      });
      expect(resJson).toHaveBeenCalledWith({ codigo: 'EXP-004', estado: 'aprobado' });
    });

    it('400 si rechaza sin justificación', async () => {
      const { req, res, resStatus, resJson } = mockReqRes({
        params: { codigo: 'EXP-004' },
        body: { estado: 'rechazado' },
      });

      await cambiarEstadoPorCodigo(req, res);

      expect(resStatus).toHaveBeenCalledWith(400);
      expect(resJson).toHaveBeenCalledWith({
        message: 'justificacion requerida cuando estado = rechazado',
      });
    });
  });

  describe('activarDesactivarPorCodigo', () => {
    it('200 cuando actualiza activo', async () => {
      (ejecutarSP as jest.Mock).mockResolvedValue([{ codigo: 'EXP-004', activo: 1 }]);

      const { req, res, resJson } = mockReqRes({
        params: { codigo: 'EXP-004' },
        body: { activo: true },
      });

      await activarDesactivarPorCodigo(req, res);

      expect(ejecutarSP).toHaveBeenCalledWith('sp_Expedientes_ActivarDesactivar', {
        codigo: 'EXP-004',
        activo: 1,
      });
      expect(resJson).toHaveBeenCalledWith({ codigo: 'EXP-004', activo: 1 });
    });

    it('404 si el SP no devuelve filas', async () => {
      (ejecutarSP as jest.Mock).mockResolvedValue([]);

      const { req, res, resStatus, resJson } = mockReqRes({
        params: { codigo: 'EXP-004' },
        body: { activo: false },
      });

      await activarDesactivarPorCodigo(req, res);

      expect(resStatus).toHaveBeenCalledWith(404);
      expect(resJson).toHaveBeenCalledWith({ message: 'Expediente no encontrado' });
    });
  });
});
