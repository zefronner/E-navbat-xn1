import Graph from '../models/graph.model.js';
import { graphValidator } from '../validation/graph.validation.js';
import { catchError } from '../utils/error-response.js';

export class GraphController {
  async createGraph(req, res) {
    try {
      const { error, value } = graphValidator(req.body);
      if (error) {
        return catchError(400, error, res);
      }
      const graph = await Graph.create(value);
      return res.status(201).json({
        statusCode: 201,
        message: 'success',
        data: graph,
      });
    } catch (error) {
      return catchError(500, error.message, res);
    }
  }

  async getAllGraphs(_, res) {
    try {
      const graphs = await Graph.find().populate('doctorId');
      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: graphs,
      });
    } catch (error) {
      return catchError(500, error.message, res);
    }
  }

  async getGraphById(req, res) {
    try {
      const graph = await GraphController.findGraphById(req.params.id, res);
      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: graph,
      });
    } catch (error) {
      return catchError(500, error.message, res);
    }
  }

  async updateGraphById(req, res) {
    try {
      const id = req.params.id;
      await GraphController.findGraphById(id, res);
      const updatedGraph = await Graph.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: updatedGraph,
      });
    } catch (error) {
      return catchError(500, error.message, res);
    }
  }

  async deleteGraphById(req, res) {
    try {
      const id = req.params.id;
      await GraphController.findGraphById(id);
      await Graph.findByIdAndDelete(id);
      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: {},
      });
    } catch (error) {
      return catchError(500, error.message, res);
    }
  }

  static async findGraphById(id, res) {
    try {
      const graph = await Graph.findById(id).populate('doctorId');
      if (!graph) {
        return catchError(404, `Graph not found by ID ${id}`, res);
      }
      return graph;
    } catch (error) {
      return catchError(500, error.message, res);
    }
  }
}
